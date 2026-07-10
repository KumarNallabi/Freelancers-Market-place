"""
db.py
-----
Database schema (Django ORM models) for the Freelance Marketplace Platform.
Contains: Freelancer, Client, Project, Bid, Contract
Database engine: SQLite (see core/settings.py)
"""
from django.db import models


class Freelancer(models.Model):
    freelancer_id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    skills = models.CharField(max_length=500)
    experience = models.IntegerField(default=0)
    hourly_rate = models.FloatField(default=0)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "freelancer_id": self.freelancer_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "skills": self.skills,
            "experience": self.experience,
            "hourly_rate": self.hourly_rate,
            "profile_image": self.profile_image.url if self.profile_image else None,
        }

    def __str__(self):
        return self.full_name


class Client(models.Model):
    client_id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "client_id": self.client_id,
            "company_name": self.company_name,
            "contact_person": self.contact_person,
            "email": self.email,
            "phone": self.phone,
            "location": self.location,
        }

    def __str__(self):
        return self.company_name


class Project(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    project_id = models.AutoField(primary_key=True)
    project_title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=100)
    budget = models.FloatField()
    deadline = models.DateField()
    client_name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "project_id": self.project_id,
            "project_title": self.project_title,
            "description": self.description,
            "category": self.category,
            "budget": self.budget,
            "deadline": str(self.deadline),
            "client_name": self.client_name,
            "status": self.status,
        }

    def __str__(self):
        return self.project_title


class Bid(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    bid_id = models.AutoField(primary_key=True)
    project_title = models.CharField(max_length=300)
    freelancer_name = models.CharField(max_length=200)
    bid_amount = models.FloatField()
    proposal = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "bid_id": self.bid_id,
            "project_title": self.project_title,
            "freelancer_name": self.freelancer_name,
            "bid_amount": self.bid_amount,
            "proposal": self.proposal,
            "status": self.status,
        }

    def __str__(self):
        return f"{self.freelancer_name} -> {self.project_title}"


class Contract(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    contract_id = models.AutoField(primary_key=True)
    project_title = models.CharField(max_length=300)
    freelancer_name = models.CharField(max_length=200)
    client_name = models.CharField(max_length=200)
    agreed_budget = models.FloatField()
    start_date = models.DateField()
    end_date = models.DateField()
    contract_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "contract_id": self.contract_id,
            "project_title": self.project_title,
            "freelancer_name": self.freelancer_name,
            "client_name": self.client_name,
            "agreed_budget": self.agreed_budget,
            "start_date": str(self.start_date),
            "end_date": str(self.end_date),
            "contract_status": self.contract_status,
        }

    def __str__(self):
        return f"Contract #{self.contract_id}"
