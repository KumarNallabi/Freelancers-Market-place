"""
Django requires model classes to be discoverable from <app>/models.py for
migrations to work automatically. The actual schema definitions live in
db.py (as required by the project's folder structure); we re-export them
here so `manage.py makemigrations` picks them up.
"""
from api.db import Freelancer, Client, Project, Bid, Contract  # noqa: F401
