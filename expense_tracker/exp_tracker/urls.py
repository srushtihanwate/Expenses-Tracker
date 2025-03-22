from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import register_user, protected_view
from .views import logout_user, lock_income, monthly_summary
from .views import request_password_reset, reset_password
from .views import (
    CategoryListCreateView, IncomeListCreateView, IncomeDetailView, 
    ExpenseListCreateView, ExpenseDetailView
)


urlpatterns = [
    path('register/', register_user, name='register_user'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('protected/', protected_view, name='protected_view'),
    path('logout/', logout_user, name='logout_user'),
    path('request-password-reset/', request_password_reset, name='request_password_reset'),
    path('reset-password/', reset_password, name='reset_password'),
    path('categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('income/', IncomeListCreateView.as_view(), name='income_list_create'),
    path('income/<int:pk>/', IncomeDetailView.as_view(), name='income_detail'),
    path('expenses/', ExpenseListCreateView.as_view(), name='expense_list_create'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense_detail'),
    path('income/<int:pk>/lock/', lock_income, name='lock_income'),
    path('summary/', monthly_summary, name='monthly_summary'),

]

