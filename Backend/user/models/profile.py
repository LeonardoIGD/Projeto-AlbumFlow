from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """
    Abstract base model for users.

    Attributes:
        type_user (CharField): The type of user, represented as a string with a maximum length of 50 characters.
        date_created (DateField): The date when the user was created. Automatically set to the current date when the user is created.
        date_updated (DateField): The date when the user was last updated. Automatically set to the current date whenever the user is updated.

    Methods:
        __str__(): Returns a string representation of the user, which is the type of user.
    """
    type_user = models.CharField(max_length=50)
    date_created = models.DateField(auto_now_add=True)
    date_updated = models.DateField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.type_user}"


class Photographer(Profile):
    """
    Photographer model that extends the Users model.

    Attributes:
        user (OneToOneField): A one-to-one relationship with the User model.
        name_photographer (CharField): The name of the photographer with a maximum length of 60 characters.
        name_company (CharField): The name of the photographer's company with a maximum length of 50 characters.
        phone (CharField): The phone number of the photographer with a maximum length of 20 characters.

    Meta:
        verbose_name (str): The singular name for the model.
        verbose_name_plural (str): The plural name for the model.

    Methods:
        __str__: Returns a string representation of the Photographer instance, combining the username and type of user.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name_photographer = models.CharField(max_length=60)
    name_company = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)

    class Meta:
        verbose_name = "Photographer"
        verbose_name_plural = "Photographers"

    def __str__(self):
        return f"{self.user.username} - {self.type_user}"
