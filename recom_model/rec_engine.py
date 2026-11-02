import sys
import os
import io
import json
import argparse
from math import radians, sin, cos, asin, sqrt

# Ensure UTF-8 output for stdout on all platforms (especially Windows cp1252)
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    except Exception:
        pass

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(max(0.0, min(1.0, a))))
    return R * c

def resolve_excel_path(specified_path=None):
    if specified_path and os.path.isfile(specified_path):
        return os.path.abspath(specified_path)
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(current_dir, "charging_stations.xlsx"),
        os.path.join(current_dir, "recom_model", "charging_stations.xlsx"),
        os.path.join(current_dir, "..", "charging_stations.xlsx"),
        os.path.join(current_dir, "..", "recom_model", "charging_stations.xlsx"),
        os.path.join(current_dir, "..", "recom_model", "recom_model", "charging_stations.xlsx"),
        os.path.join(os.getcwd(), "recom_model", "charging_stations.xlsx"),
        os.path.join(os.getcwd(), "recom_model", "recom_model", "charging_stations.xlsx"),
        os.path.join(os.getcwd(), "charging_stations.xlsx")
    ]
    for path in candidates:
        if os.path.isfile(path):
            return os.path.abspath(path)
    return None

def load_stations_data(excel_path):
    import pandas as pd
    if not excel_path or not os.path.isfile(excel_path):
        raise FileNotFoundError(f"Charging stations dataset not found. Checked path: {excel_path}")
    
    df = pd.read_excel(excel_path)
    
    # Normalize capacity
    if "capacity" in df.columns:
        df["capacity"] = (df["capacity"].astype(str).str.lower().str.replace("kw", "", regex=False).str.strip())
        df["capacity"] = pd.to_numeric(df["capacity"], errors="coerce").fillna(0.0)
    else:
        df["capacity"] = 0.0

    # Normalize availability
    if "available" in df.columns:
        df["available"] = pd.to_numeric(df["available"], errors="coerce").fillna(0)
    else:
        df["available"] = 0

    stations = {}
    for _, row in df.iterrows():
        uid = str(row.get("uid", ""))
        stations[uid] = {
            "uid": uid,
            "name": str(row.get("name", "Unknown Station")),
            "vendor_name": str(row.get("vendor_name", "")),
            "address": str(row.get("address", "")),
            "latitude": float(row.get("latitude", 0.0)),
            "longitude": float(row.get("longitude", 0.0)),
            "city": str(row.get("city", "")),
            "country": str(row.get("country", "")),
            "open": str(row.get("open", "")),
            "close": str(row.get("close", "")),
            "logo_url": str(row.get("logo_url", "")),
            "staff": str(row.get("staff", "")),
            "payment_modes": str(row.get("payment_modes", "")),
            "contact_numbers": str(row.get("contact_numbers", "")),
            "station_type": str(row.get("station_type", "")),
            "postal_code": str(row.get("postal_code", "")),
            "zone": str(row.get("zone", "")),
            "charging_speed": float(row.get("capacity", 0.0)),
            "capacity": float(row.get("capacity", 0.0)),
            "price": str(row.get("cost_per_unit", "")),
            "cost_per_unit": str(row.get("cost_per_unit", "")),
            "availability": int(row.get("available", 0)),
            "available": int(row.get("available", 0)),
            "power_type": str(row.get("power_type", "")),
            "total": int(row.get("total", 0)),
            "type": str(row.get("type", "")),
            "charger_type": str(row.get("type", "")),
            "vehicle_type": str(row.get("vehicle_type", ""))
        }
    return stations

def recommend_stations(user_input, excel_path=None):
    try:
        excel_resolved = resolve_excel_path(excel_path)
        if not excel_resolved:
            return {
                "success": False,
                "error": "Charging stations dataset file (charging_stations.xlsx) could not be located.",
                "total": 0,
                "results": []
            }
        
        stations = load_stations_data(excel_resolved)

        try:
            user_lat = float(user_input.get("latitude"))
            user_lon = float(user_input.get("longitude"))
        except (TypeError, ValueError):
            return {
                "success": False,
                "error": "Invalid or missing latitude and longitude coordinates.",
                "total": 0,
                "results": []
            }

        battery = float(user_input.get("battery", 50.0))
        min_speed = float(user_input.get("min_charging_speed", 0.0))
        filter_power = user_input.get("power_type", None)
        filter_vehicle = user_input.get("vehicle_type", None)

        # 1. Calculate Haversine distance
        for station in stations.values():
            station["distance"] = haversine(
                user_lat, user_lon,
                station["latitude"], station["longitude"]
            )

        # 2. Filter available stations and minimum charging speed
        candidates = {}
        for uid, station in stations.items():
            if station["availability"] > 0 and station["charging_speed"] >= min_speed:
                if filter_power and filter_power.upper() not in station["power_type"].upper():
                    continue
                if filter_vehicle and filter_vehicle.upper() not in station["vehicle_type"].upper():
                    continue
                candidates[uid] = station

        if len(candidates) == 0:
            return {
                "success": True,
                "total": 0,
                "results": [],
                "message": "No compatible and available charging stations found matching your criteria."
            }

        # 3. Calculate distance and charging speed scores
        distances = [s["distance"] for s in candidates.values()]
        min_dist = min(distances)
        max_dist = max(distances)

        speeds = [s["charging_speed"] for s in candidates.values()]
        max_speed = max(speeds) if speeds else 1.0

        results = []
        for uid, station in candidates.items():
            if max_dist == min_dist:
                distance_score = 1.0
            else:
                distance_score = (max_dist - station["distance"]) / (max_dist - min_dist)

            speed_score = (station["charging_speed"] / max_speed) if max_speed > 0 else 1.0

            # 50% Distance Score + 50% Charging Speed Score
            final_score = 0.5 * distance_score + 0.5 * speed_score

            results.append({
                "uid": station["uid"],
                "name": station["name"],
                "vendor_name": station["vendor_name"],
                "address": station["address"],
                "city": station["city"],
                "country": station["country"],
                "latitude": station["latitude"],
                "longitude": station["longitude"],
                "distance": round(station["distance"], 2),
                "speed": station["charging_speed"],
                "charging_speed": station["charging_speed"],
                "cost_per_unit": station["cost_per_unit"],
                "price": station["cost_per_unit"],
                "available": station["availability"],
                "availability": station["availability"],
                "total": station["total"],
                "power_type": station["power_type"],
                "charger_type": station["charger_type"],
                "vehicle_type": station["vehicle_type"],
                "open": station["open"],
                "close": station["close"],
                "distance_score": round(distance_score, 4),
                "speed_score": round(speed_score, 4),
                "score": round(final_score, 4)
            })

        # 4. Sort descending by final score
        results.sort(key=lambda x: x["score"], reverse=True)

        return {
            "success": True,
            "total": len(results),
            "results": results,
            "user_query": {
                "latitude": user_lat,
                "longitude": user_lon,
                "battery": battery,
                "min_charging_speed": min_speed
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "total": 0,
            "results": []
        }

def main():
    parser = argparse.ArgumentParser(description="ChargeNav EV Charging Station Recommendation Engine")
    parser.add_argument("--json", type=str, help="JSON input string containing user location and preferences")
    parser.add_argument("--stdin", action="store_true", help="Read JSON input from standard input")
    parser.add_argument("--excel", type=str, help="Path to charging_stations.xlsx file")
    args = parser.parse_args()

    user_input = None

    if args.json:
        try:
            user_input = json.loads(args.json)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Invalid JSON string: {e}"}))
            sys.exit(1)
    elif args.stdin or not sys.stdin.isatty():
        try:
            raw_input = sys.stdin.read().strip()
            if raw_input:
                user_input = json.loads(raw_input)
        except Exception as e:
            print(json.dumps({"success": False, "error": f"Invalid JSON input from stdin: {e}"}))
            sys.exit(1)
    
    # Fallback to interactive mode if run directly from a terminal without input
    if user_input is None:
        try:
            print("--- ChargeNav Recommendation Engine (Interactive Mode) ---")
            lat = float(input("Your latitude: "))
            lon = float(input("Your longitude: "))
            bat = float(input("Battery percentage: "))
            speed = float(input("Minimum charging speed you prefer (kW): "))
            user_input = {
                "latitude": lat,
                "longitude": lon,
                "battery": bat,
                "min_charging_speed": speed
            }
        except (ValueError, KeyboardInterrupt, EOFError):
            print(json.dumps({"success": False, "error": "Invalid interactive input."}))
            sys.exit(1)

    result = recommend_stations(user_input, excel_path=args.excel)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()