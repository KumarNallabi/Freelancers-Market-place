from django.contrib import admin
from api.db import Freelancer, Client, Project, Bid, Contract

admin.site.register(Freelancer)
admin.site.register(Client)
admin.site.register(Project)
admin.site.register(Bid)
admin.site.register(Contract)
