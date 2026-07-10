"""
views.py
--------
Function-Based Views implementing the REST APIs for the Freelance
Marketplace Platform (Freelancer, Client, Project, Bid, Contract modules)
plus bonus features (search/filter, dashboard stats).
"""
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from api.db import Freelancer, Client, Project, Bid, Contract


def _parse_body(request):
    """Safely parse JSON body; supports multipart form data too (for image upload)."""
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        return request.POST
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}


def _error(message, status=400):
    return JsonResponse({"success": False, "error": message}, status=status)


# ---------------------------------------------------------------------------
# MODULE 1 - FREELANCER MANAGEMENT
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def add_freelancer(request):
    data = _parse_body(request)
    try:
        freelancer = Freelancer.objects.create(
            full_name=data.get('full_name', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            skills=data.get('skills', ''),
            experience=data.get('experience', 0) or 0,
            hourly_rate=data.get('hourly_rate', 0) or 0,
            profile_image=request.FILES.get('profile_image') if request.FILES else None,
        )
        return JsonResponse({"success": True, "data": freelancer.to_dict()}, status=201)
    except Exception as e:
        return _error(str(e))


@csrf_exempt
@require_http_methods(["GET"])
def get_freelancers(request):
    freelancers = Freelancer.objects.all().order_by('-created_at')
    return JsonResponse({"success": True, "data": [f.to_dict() for f in freelancers]})


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_freelancer(request, id):
    try:
        freelancer = Freelancer.objects.get(pk=id)
    except Freelancer.DoesNotExist:
        return _error("Freelancer not found", 404)

    data = _parse_body(request)
    for field in ['full_name', 'email', 'phone', 'skills', 'experience', 'hourly_rate']:
        if field in data:
            setattr(freelancer, field, data[field])
    freelancer.save()
    return JsonResponse({"success": True, "data": freelancer.to_dict()})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_freelancer(request, id):
    try:
        freelancer = Freelancer.objects.get(pk=id)
        freelancer.delete()
        return JsonResponse({"success": True, "message": "Freelancer deleted"})
    except Freelancer.DoesNotExist:
        return _error("Freelancer not found", 404)


# ---------------------------------------------------------------------------
# MODULE 2 - CLIENT MANAGEMENT
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def add_client(request):
    data = _parse_body(request)
    try:
        client = Client.objects.create(
            company_name=data.get('company_name', ''),
            contact_person=data.get('contact_person', ''),
            email=data.get('email', ''),
            phone=data.get('phone', ''),
            location=data.get('location', ''),
        )
        return JsonResponse({"success": True, "data": client.to_dict()}, status=201)
    except Exception as e:
        return _error(str(e))


@csrf_exempt
@require_http_methods(["GET"])
def get_clients(request):
    clients = Client.objects.all().order_by('-created_at')
    return JsonResponse({"success": True, "data": [c.to_dict() for c in clients]})


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_client(request, id):
    try:
        client = Client.objects.get(pk=id)
    except Client.DoesNotExist:
        return _error("Client not found", 404)

    data = _parse_body(request)
    for field in ['company_name', 'contact_person', 'email', 'phone', 'location']:
        if field in data:
            setattr(client, field, data[field])
    client.save()
    return JsonResponse({"success": True, "data": client.to_dict()})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_client(request, id):
    try:
        client = Client.objects.get(pk=id)
        client.delete()
        return JsonResponse({"success": True, "message": "Client deleted"})
    except Client.DoesNotExist:
        return _error("Client not found", 404)


# ---------------------------------------------------------------------------
# MODULE 3 - PROJECT MANAGEMENT
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def add_project(request):
    data = _parse_body(request)
    try:
        project = Project.objects.create(
            project_title=data.get('project_title', ''),
            description=data.get('description', ''),
            category=data.get('category', ''),
            budget=data.get('budget', 0) or 0,
            deadline=data.get('deadline'),
            client_name=data.get('client_name', ''),
            status=data.get('status', 'Open'),
        )
        return JsonResponse({"success": True, "data": project.to_dict()}, status=201)
    except Exception as e:
        return _error(str(e))


@csrf_exempt
@require_http_methods(["GET"])
def get_projects(request):
    projects = Project.objects.all().order_by('-created_at')

    # Bonus: search & filter
    search = request.GET.get('search')
    category = request.GET.get('category')
    status = request.GET.get('status')

    if search:
        projects = projects.filter(project_title__icontains=search)
    if category:
        projects = projects.filter(category__icontains=category)
    if status:
        projects = projects.filter(status__iexact=status)

    return JsonResponse({"success": True, "data": [p.to_dict() for p in projects]})


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_project(request, id):
    try:
        project = Project.objects.get(pk=id)
    except Project.DoesNotExist:
        return _error("Project not found", 404)

    data = _parse_body(request)
    for field in ['project_title', 'description', 'category', 'budget', 'deadline', 'client_name', 'status']:
        if field in data:
            setattr(project, field, data[field])
    project.save()
    return JsonResponse({"success": True, "data": project.to_dict()})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_project(request, id):
    try:
        project = Project.objects.get(pk=id)
        project.delete()
        return JsonResponse({"success": True, "message": "Project deleted"})
    except Project.DoesNotExist:
        return _error("Project not found", 404)


# ---------------------------------------------------------------------------
# MODULE 4 - BID MANAGEMENT
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def add_bid(request):
    data = _parse_body(request)
    try:
        bid = Bid.objects.create(
            project_title=data.get('project_title', ''),
            freelancer_name=data.get('freelancer_name', ''),
            bid_amount=data.get('bid_amount', 0) or 0,
            proposal=data.get('proposal', ''),
            status=data.get('status', 'Pending'),
        )
        return JsonResponse({"success": True, "data": bid.to_dict()}, status=201)
    except Exception as e:
        return _error(str(e))


@csrf_exempt
@require_http_methods(["GET"])
def get_bids(request):
    bids = Bid.objects.all().order_by('-created_at')

    project_title = request.GET.get('project_title')
    freelancer_name = request.GET.get('freelancer_name')
    status = request.GET.get('status')

    if project_title:
        bids = bids.filter(project_title__icontains=project_title)
    if freelancer_name:
        bids = bids.filter(freelancer_name__icontains=freelancer_name)
    if status:
        bids = bids.filter(status__iexact=status)

    return JsonResponse({"success": True, "data": [b.to_dict() for b in bids]})


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_bid(request, id):
    """Also used to Accept/Reject a bid by sending {"status": "Accepted"/"Rejected"}"""
    try:
        bid = Bid.objects.get(pk=id)
    except Bid.DoesNotExist:
        return _error("Bid not found", 404)

    data = _parse_body(request)
    for field in ['project_title', 'freelancer_name', 'bid_amount', 'proposal', 'status']:
        if field in data:
            setattr(bid, field, data[field])
    bid.save()
    return JsonResponse({"success": True, "data": bid.to_dict()})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_bid(request, id):
    try:
        bid = Bid.objects.get(pk=id)
        bid.delete()
        return JsonResponse({"success": True, "message": "Bid deleted"})
    except Bid.DoesNotExist:
        return _error("Bid not found", 404)


# ---------------------------------------------------------------------------
# MODULE 5 - CONTRACT MANAGEMENT
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def add_contract(request):
    data = _parse_body(request)
    try:
        contract = Contract.objects.create(
            project_title=data.get('project_title', ''),
            freelancer_name=data.get('freelancer_name', ''),
            client_name=data.get('client_name', ''),
            agreed_budget=data.get('agreed_budget', 0) or 0,
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            contract_status=data.get('contract_status', 'Active'),
        )
        return JsonResponse({"success": True, "data": contract.to_dict()}, status=201)
    except Exception as e:
        return _error(str(e))


@csrf_exempt
@require_http_methods(["GET"])
def get_contracts(request):
    contracts = Contract.objects.all().order_by('-created_at')
    freelancer_name = request.GET.get('freelancer_name')
    client_name = request.GET.get('client_name')

    if freelancer_name:
        contracts = contracts.filter(freelancer_name__icontains=freelancer_name)
    if client_name:
        contracts = contracts.filter(client_name__icontains=client_name)

    return JsonResponse({"success": True, "data": [c.to_dict() for c in contracts]})


@csrf_exempt
@require_http_methods(["PUT", "PATCH"])
def update_contract(request, id):
    try:
        contract = Contract.objects.get(pk=id)
    except Contract.DoesNotExist:
        return _error("Contract not found", 404)

    data = _parse_body(request)
    for field in ['project_title', 'freelancer_name', 'client_name', 'agreed_budget',
                  'start_date', 'end_date', 'contract_status']:
        if field in data:
            setattr(contract, field, data[field])
    contract.save()
    return JsonResponse({"success": True, "data": contract.to_dict()})


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_contract(request, id):
    try:
        contract = Contract.objects.get(pk=id)
        contract.delete()
        return JsonResponse({"success": True, "message": "Contract deleted"})
    except Contract.DoesNotExist:
        return _error("Contract not found", 404)


# ---------------------------------------------------------------------------
# BONUS FEATURES
# ---------------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["GET"])
def search_freelancers(request):
    """Bonus: Freelancer skill search -> /freelancers/search/?skill=Django"""
    skill = request.GET.get('skill', '')
    freelancers = Freelancer.objects.filter(skills__icontains=skill)
    return JsonResponse({"success": True, "data": [f.to_dict() for f in freelancers]})


@csrf_exempt
@require_http_methods(["GET"])
def dashboard_stats(request):
    """Bonus: Dashboard statistics (Projects, Bids, Contracts)"""
    stats = {
        "total_freelancers": Freelancer.objects.count(),
        "total_clients": Client.objects.count(),
        "total_projects": Project.objects.count(),
        "open_projects": Project.objects.filter(status='Open').count(),
        "in_progress_projects": Project.objects.filter(status='In Progress').count(),
        "completed_projects": Project.objects.filter(status='Completed').count(),
        "total_bids": Bid.objects.count(),
        "pending_bids": Bid.objects.filter(status='Pending').count(),
        "accepted_bids": Bid.objects.filter(status='Accepted').count(),
        "rejected_bids": Bid.objects.filter(status='Rejected').count(),
        "total_contracts": Contract.objects.count(),
        "active_contracts": Contract.objects.filter(contract_status='Active').count(),
        "completed_contracts": Contract.objects.filter(contract_status='Completed').count(),
    }
    return JsonResponse({"success": True, "data": stats})
