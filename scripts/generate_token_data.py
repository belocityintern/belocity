import json
import random
import time

def generate_mock_token_data(token_count=5):
    """Generates a list of mock token data."""
    tokens = []
    narratives = ["AI Integration", "DeFi 2.0", "Gaming Guild", "RWA Tokenization", "Privacy Layer"]
    for i in range(token_count):
        belief_velocity = round(random.uniform(30, 98), 1)
        tokens.append({
            "id": f"py_{i+1}",
            "name": f"PythonToken{i+1}",
            "symbol": f"PYT{i+1}",
            "contract": f"0x{random.randbytes(20).hex()}",
            "beliefVelocity": belief_velocity,
            "velocityDelta": round(random.uniform(-15, 15), 1),
            "reflexivityScore": round(random.uniform(0.2, 0.9), 2),
            "socialVolume": random.randint(1000, 30000),
            "sentimentScore": round(random.uniform(0.3, 0.95), 2),
            "narrativeMomentum": random.choice(narratives),
            "lastUpdate": f"{random.randint(1, 60)}s ago",
            "chartData": generate_chart_data(belief_velocity)
        })
    return tokens

def generate_chart_data(current_velocity, points=6):
    """Generates mock chart data leading up to the current velocity."""
    data = []
    velocity = current_velocity
    for i in range(points, 0, -1):
        data.insert(0, {
            "time": f"{(points - i) * 4:02d}:00",
            "velocity": round(max(0, min(100, velocity)), 1)
        })
        velocity -= random.uniform(-5, 7) # Fluctuate backwards in time
    return data

if __name__ == "__main__":
    print("=============================================")
    print("  Executing Python Script: generate_token_data.py")
    print(f"  Timestamp: {time.ctime()}")
    print("=============================================")
    
    mock_data = generate_mock_token_data()
    
    # Print data as a JSON string, which could be consumed by a frontend or another service
    print("\n--- Generated Mock Token Data (JSON) ---\n")
    print(json.dumps(mock_data, indent=2))
    
    print("\n=============================================")
    print("  Script execution complete.")
    print("=============================================")
