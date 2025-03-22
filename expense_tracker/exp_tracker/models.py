from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    month = models.DateField()  # Changed from CharField to DateField
    is_locked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.month.strftime('%B')} - ₹{self.amount}"

# class Expense(models.Model):
    # user = models.ForeignKey(User, on_delete=models.CASCADE)
    # category = models.ForeignKey(Category, on_delete=models.CASCADE)
    # amount = models.DecimalField(max_digits=10, decimal_places=2)
    # description = models.TextField(blank=True)
    # date = models.DateField()

    # def __str__(self):
    #     return f"{self.user.username} - {self.category.name} - ₹{self.amount}"


from django.contrib.auth.models import User
class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # ForeignKey expects ID
    category = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()