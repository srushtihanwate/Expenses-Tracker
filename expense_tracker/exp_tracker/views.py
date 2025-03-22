from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.urls import reverse
# from .utils import reset_token_generator
# from django.core.exceptions import ValidationError
# from django.contrib.auth.password_validation import validate_password
from rest_framework import generics, permissions
from .models import Income, Expense, Category
from .serializers import IncomeSerializer, ExpenseSerializer, CategorySerializer
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.urls import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from django.utils.dateparse import parse_date
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Income, Expense

@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "This is a protected route!"})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data['refresh']
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Successfully logged out!"})
    except Exception as e:
        return Response({"error": "Invalid token"}, status=40)
    
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def lock_income(request, pk):
    try:
        income = Income.objects.get(pk=pk, user=request.user)

        # Lock the income
        income.is_locked = True
        income.save()
        return Response({"message": f"Income for {income.month.strftime('%B')} has been locked."}, status=200)

    except Income.DoesNotExist:
        return Response({"error": "Income not found"}, status=404)



@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        reset_link = f"http://127.0.0.1:5500/expense_tracker/frontend/resetpassword.html?user_id={user.id}"
        send_mail(
            "Password Reset Request",
            f"Click the link to reset your password: {reset_link}",
            "noreply@example.com",
            [email],
            fail_silently=False,
        )
        return Response({"message": "Password reset link sent to your email!"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def reset_password(request):
    user_id = request.query_params.get('user_id')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Invalid user ID"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    # Get month from query params
    month_str = request.query_params.get('month')
    if not month_str:
        return Response({"error": "Month is required (format: YYYY-MM)"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        month_date = parse_date(month_str + "-01")
        if not month_date:
            raise ValueError
    except ValueError:
        return Response({"error": "Invalid month format. Use YYYY-MM"}, status=status.HTTP_400_BAD_REQUEST)

    # Get the user's income and expenses for the month
    user = request.user
    income = Income.objects.filter(user=user, month__year=month_date.year, month__month=month_date.month).aggregate(total_income=Sum('amount'))['total_income'] or 0
    expenses = Expense.objects.filter(user=user, date__year=month_date.year, date__month=month_date.month).aggregate(total_expenses=Sum('amount'))['total_expenses'] or 0

    # Calculate the remaining balance
    balance = income - expenses

    # Return the summary
    return Response({
        "month": month_date.strftime("%B %Y"),
        "total_income": income,
        "total_expenses": expenses,
        "balance": balance
    })

# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

# Income Views
class IncomeListCreateView(generics.ListCreateAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IncomeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        income = self.get_object()

        # Prevent updates if income is locked
        if income.is_locked:
            raise ValidationError(f"Income for {income.month.strftime('%B')} is locked and cannot be updated.")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Prevent deletion if income is locked
        if instance.is_locked:
            raise ValidationError(f"Income for {instance.month.strftime('%B')} is locked and cannot be deleted.")
        
        instance.delete()


# Expense Views
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).select_related("category")

    def perform_create(self, serializer):
        serializer.save(user = self.request.user)
        expense_amount = serializer.validated_data['amount']
        expense_date = serializer.validated_data.get('date')

        # Extract year and month from the expense date
        expense_year = expense_date.year
        expense_month = expense_date.month

        try:
            income = Income.objects.get(
                user=User,
                month__year=expense_year,
                month__month=expense_month
            )
        except Income.DoesNotExist:
            raise ValidationError(f"No income set for {expense_date.strftime('%B %Y')}. Please add income first.")

        # Check if expense exceeds income
        if income.amount < expense_amount:
            raise ValidationError(f"Expense exceeds available income for {expense_date.strftime('%B')}. You have ₹{income.amount} left.")

        # Deduct expense from income
        income.amount -= expense_amount
        income.save()

        # Save the expense
        serializer.save(user=User)

from django.utils.dateparse import parse_date

class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user)

def perform_update(self, serializer):
    user = self.request.user
    instance = self.get_object()
    
    print("Received Data:", self.request.data)  # Debugging: Log incoming data

    old_amount = instance.amount
    new_amount = serializer.validated_data.get('amount', instance.amount)
    new_date_str = self.request.data.get('date', instance.date)

    # 🔹 Log the received date to check format
    print("Raw Date Received:", new_date_str)

    # 🔹 Ensure the date is in correct format (YYYY-MM-DD)
    new_date = parse_date(new_date_str) if isinstance(new_date_str, str) else new_date_str
    if not new_date:
        raise ValidationError("Invalid date format. Please use YYYY-MM-DD.")

    try:
        income = Income.objects.get(user=user, month=instance.date.strftime('%B'))

        # Restore old amount to income before deducting the new amount
        income.amount += old_amount

        # Check if the new expense exceeds available income
        if new_amount > income.amount:
            raise ValidationError(f"Updated expense exceeds available income for {instance.date.strftime('%B')}. You have ₹{income.amount} left.")

        # Deduct new amount and save
        income.amount -= new_amount
        income.save()

        # Save expense with correctly parsed date
        serializer.save(date=new_date)

    except Income.DoesNotExist:
        raise ValidationError(f"No income set for {instance.date.strftime('%B')}. Please add income first.")


        
    







































































