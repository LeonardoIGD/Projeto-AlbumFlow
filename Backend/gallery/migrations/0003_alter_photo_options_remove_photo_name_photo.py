# Generated by Django 5.1.7 on 2025-03-25 00:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0002_remove_album_uuid_album_alter_album_created_at_album_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='photo',
            options={'ordering': ['id'], 'verbose_name': 'Photo', 'verbose_name_plural': 'Photos'},
        ),
        migrations.RemoveField(
            model_name='photo',
            name='name_photo',
        ),
    ]
