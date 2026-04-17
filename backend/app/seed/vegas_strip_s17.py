"""
Vegas Strip S17 — 6-deck basic strategy.
Dealer stands on soft 17, double after split allowed, no surrender.

Actions:
  H  = Hit
  S  = Stand
  D  = Double (hit if not allowed)
  Ds = Double (stand if not allowed)
  P  = Split
  Ph = Split if DAS allowed, else Hit
"""

RULESET_META = {
    "name": "Vegas Strip S17",
    "deck_count": 6,
    "dealer_hits_s17": False,
    "das_allowed": True,
    "surrender": "none",
    "description": "Classic Vegas Strip rules. 6-deck shoe, dealer stands on soft 17, double after split allowed, no surrender.",
}

# Dealer upcards across columns: 2, 3, 4, 5, 6, 7, 8, 9, 10, A
DEALER_CARDS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"]

STRATEGY = {
    "hard": {
        #        2    3    4    5    6    7    8    9    10   A
        "5":  ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
        "6":  ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
        "7":  ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
        "8":  ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"],
        "9":  ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
        "10": ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
        "11": ["D", "D", "D", "D", "D", "D", "D", "D", "D", "D"],
        "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"],
        "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
        "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
        "15": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
        "16": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"],
        "17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        "18": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        "19": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        "20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
    },
    "soft": {
        #         2    3    4    5    6    7    8    9    10   A
        "A2":  ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
        "A3":  ["H", "H", "H", "D", "D", "H", "H", "H", "H", "H"],
        "A4":  ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
        "A5":  ["H", "H", "D", "D", "D", "H", "H", "H", "H", "H"],
        "A6":  ["H", "D", "D", "D", "D", "H", "H", "H", "H", "H"],
        "A7":  ["Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"],
        "A8":  ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"],
        "A9":  ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
    },
    "pair": {
        #         2    3    4    5    6    7    8    9    10   A
        "22":  ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"],
        "33":  ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"],
        "44":  ["H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"],
        "55":  ["D", "D", "D", "D", "D", "D", "D", "D", "H", "H"],
        "66":  ["Ph", "P", "P", "P", "P", "H", "H", "H", "H", "H"],
        "77":  ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"],
        "88":  ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
        "99":  ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"],
        "TT":  ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"],
        "AA":  ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"],
    },
}
