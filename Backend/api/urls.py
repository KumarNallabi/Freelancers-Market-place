from django.urls import path
from api import views

urlpatterns = [
    # Module 1 - Freelancer Management
    path('freelancers/add/', views.add_freelancer),
    path('freelancers/', views.get_freelancers),
    path('freelancers/update/<int:id>/', views.update_freelancer),
    path('freelancers/delete/<int:id>/', views.delete_freelancer),
    path('freelancers/search/', views.search_freelancers),  # bonus

    # Module 2 - Client Management
    path('clients/add/', views.add_client),
    path('clients/', views.get_clients),
    path('clients/update/<int:id>/', views.update_client),
    path('clients/delete/<int:id>/', views.delete_client),

    # Module 3 - Project Management
    path('projects/add/', views.add_project),
    path('projects/', views.get_projects),
    path('projects/update/<int:id>/', views.update_project),
    path('projects/delete/<int:id>/', views.delete_project),

    # Module 4 - Bid Management
    path('bids/add/', views.add_bid),
    path('bids/', views.get_bids),
    path('bids/update/<int:id>/', views.update_bid),
    path('bids/delete/<int:id>/', views.delete_bid),

    # Module 5 - Contract Management
    path('contracts/add/', views.add_contract),
    path('contracts/', views.get_contracts),
    path('contracts/update/<int:id>/', views.update_contract),
    path('contracts/delete/<int:id>/', views.delete_contract),

    # Bonus - Dashboard stats
    path('dashboard/stats/', views.dashboard_stats),
]
