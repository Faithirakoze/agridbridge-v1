from __future__ import annotations

from statistics import mean

import httpx

from app.core.config import settings


class WeatherServiceError(Exception):
    pass


def build_weather_alerts(location_name: str) -> list[dict]:
    coordinates = _geocode_location(location_name)
    forecast = _fetch_forecast(coordinates["latitude"], coordinates["longitude"])
    alerts = _generate_alerts(location_name, forecast)

    if not alerts:
        raise WeatherServiceError("No weather data available for alerts")

    return alerts


def _geocode_location(location_name: str) -> dict:
    try:
        response = httpx.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={
                "name": location_name,
                "count": 1,
                "language": "en",
                "format": "json",
                "country": settings.WEATHER_ALERT_COUNTRY_CODE,
            },
            timeout=settings.WEATHER_API_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        payload = response.json()
    except httpx.HTTPError as exc:
        raise WeatherServiceError("Unable to geocode alert location") from exc

    results = payload.get("results") or []
    if not results:
        raise WeatherServiceError(f"Location '{location_name}' could not be resolved")

    return results[0]


def _fetch_forecast(latitude: float, longitude: float) -> dict:
    try:
        response = httpx.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": ",".join(
                    [
                        "temperature_2m",
                        "relative_humidity_2m",
                        "precipitation",
                        "wind_speed_10m",
                        "weather_code",
                    ]
                ),
                "hourly": ",".join(
                    [
                        "temperature_2m",
                        "precipitation_probability",
                        "precipitation",
                        "wind_speed_10m",
                    ]
                ),
                "forecast_days": 3,
                "timezone": "auto",
            },
            timeout=settings.WEATHER_API_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
        raise WeatherServiceError("Unable to fetch live weather data") from exc


def _generate_alerts(location_name: str, forecast: dict) -> list[dict]:
    current = forecast.get("current") or {}
    current_units = forecast.get("current_units") or {}
    hourly = forecast.get("hourly") or {}

    temperatures = (hourly.get("temperature_2m") or [])[:24]
    rain_probabilities = (hourly.get("precipitation_probability") or [])[:24]
    rainfall = (hourly.get("precipitation") or [])[:24]
    wind_speeds = (hourly.get("wind_speed_10m") or [])[:24]

    observed_at = current.get("time")
    temp_unit = current_units.get("temperature_2m", "C")
    wind_unit = current_units.get("wind_speed_10m", "km/h")
    rain_unit = current_units.get("precipitation", "mm")

    alerts: list[dict] = [
        {
            "id": "weather-now",
            "type": "weather",
            "title": f"Live weather in {location_name}",
            "body": (
                f"Now {round(current.get('temperature_2m', 0))} {temp_unit} with "
                f"{_describe_weather_code(current.get('weather_code'))}. "
                f"Wind {round(current.get('wind_speed_10m', 0))} {wind_unit}."
            ),
            "location": location_name,
            "observed_at": observed_at,
            "source": "Open-Meteo",
        }
    ]

    max_rain_probability = max(rain_probabilities, default=0)
    total_rainfall = round(sum(rainfall), 1) if rainfall else 0
    max_wind = max(wind_speeds, default=0)
    max_temperature = max(temperatures, default=current.get("temperature_2m", 0) or 0)
    avg_temperature = round(mean(temperatures), 1) if temperatures else current.get("temperature_2m", 0)

    if max_rain_probability >= 70 or total_rainfall >= 15:
        alerts.append(
            {
                "id": "weather-rain",
                "type": "weather",
                "title": "Heavy rain risk in the next 24 hours",
                "body": (
                    f"Rain chance peaks at {round(max_rain_probability)}% with about "
                    f"{total_rainfall} {rain_unit} expected. Delay spraying and protect stored produce."
                ),
                "location": location_name,
                "observed_at": observed_at,
                "source": "Open-Meteo",
            }
        )

    if max_wind >= 35:
        alerts.append(
            {
                "id": "weather-wind",
                "type": "weather",
                "title": "Strong winds likely today",
                "body": (
                    f"Wind may reach {round(max_wind)} {wind_unit}. Secure seedlings, shade nets, and loose materials."
                ),
                "location": location_name,
                "observed_at": observed_at,
                "source": "Open-Meteo",
            }
        )

    if max_temperature >= 32:
        alerts.append(
            {
                "id": "weather-heat",
                "type": "weather",
                "title": "Hot conditions expected",
                "body": (
                    f"Temperatures may climb to {round(max_temperature)} {temp_unit}. "
                    f"Plan irrigation early and avoid transplanting during peak heat."
                ),
                "location": location_name,
                "observed_at": observed_at,
                "source": "Open-Meteo",
            }
        )

    if len(alerts) == 1:
        alerts.append(
            {
                "id": "weather-outlook",
                "type": "general",
                "title": "Weather outlook is stable",
                "body": (
                    f"Average temperature over the next 24 hours is about {avg_temperature} {temp_unit}. "
                    f"Use the live update above to plan routine fieldwork."
                ),
                "location": location_name,
                "observed_at": observed_at,
                "source": "Open-Meteo",
            }
        )

    return alerts


def _describe_weather_code(code: int | None) -> str:
    if code is None:
        return "current conditions unavailable"

    descriptions = {
        0: "clear skies",
        1: "mainly clear skies",
        2: "partly cloudy weather",
        3: "overcast conditions",
        45: "fog",
        48: "depositing rime fog",
        51: "light drizzle",
        53: "moderate drizzle",
        55: "dense drizzle",
        61: "light rain",
        63: "moderate rain",
        65: "heavy rain",
        80: "rain showers",
        81: "moderate rain showers",
        82: "violent rain showers",
        95: "thunderstorms",
    }
    return descriptions.get(code, "changing weather")
