from functools import wraps
from flask import request, abort

def require_wra_sign(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        header_value = request.headers.get("X-Attestation")

        if header_value is None or header_value.lower() != "true":
            abort(403, description="Cookie broken")

        return func(*args, **kwargs)
    return wrapper
