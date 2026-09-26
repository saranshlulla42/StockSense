from dataclasses import dataclass


@dataclass
class CurrentUser:
    id: int
    login_id: str
    full_name: str


def get_current_user() -> CurrentUser:
    return CurrentUser(id=1, login_id="demo", full_name="Demo User")
