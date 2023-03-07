# mysite/urls.py
from django.contrib import admin
from django.urls import include, path, re_path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.shortcuts import render


def render_react(request):
    return render(request, "index.html")


urlpatterns = [
    re_path(r"^map/$", render_react),
    re_path(r"^account/$", render_react),
    re_path(r"^/$", render_react),
    re_path(r"^api/$", render_react),
    re_path(r"^chat/$", render_react),
    re_path(r"^(?:.*)/?$", render_react),
    path("admin/", admin.site.urls),
]
