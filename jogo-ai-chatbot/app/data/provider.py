from abc import ABC, abstractmethod
from app.models.player import PlayerData


class PlayerDataProvider(ABC):
    """Abstract interface for retrieving player profile and performance data."""

    @abstractmethod
    def get_player_data(self, player_id: str) -> PlayerData | None:
        ...
