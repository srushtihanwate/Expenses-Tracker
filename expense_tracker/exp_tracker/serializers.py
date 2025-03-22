from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Income, Expense, Category


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}
        
# class ExpenseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Expense
#         fields = ['id', 'category', 'amount', 'date', 'user']
#         extra_kwargs = {'user': {'read_only': True}}  # Make user field read-only
class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()  # ✅ Add this line

    class Meta:
        model = Expense
        fields = ['id', 'category','category_name', 'amount', 'date', 'user']
        extra_kwargs = {'user': {'read_only': True}}  # Prevents user field issues
        
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None 
