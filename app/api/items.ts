export interface WeaponStats {
    weaponProperties: string[];
    rangeType: 'Melee' | 'Ranged';
}

export interface ArmorStats {
    baseArmorClass: number;
    armorType: 'Light' | 'Medium' | 'Heavy';
}

export interface Item {
    id: string;
    name: string;
    equipmentType: 'Weapon' | 'Armor' | 'Shield';
    weaponStats?: WeaponStats;
    armorStats?: ArmorStats;
}

export const items: Item[] = [
    {
        "id": "1",
        "name": "Club",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Light"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "2",
        "name": "Dagger",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Finesse", "Light", "Thrown"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "3",
        "name": "Greatclub",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "4",
        "name": "Handaxe",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Light", "Thrown"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "5",
        "name": "Javelin",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Thrown"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "6",
        "name": "Light Hammer",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Light", "Thrown"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "7",
        "name": "Mace",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": [],
            "rangeType": "Melee"
        }
    },
    {
        "id": "8",
        "name": "Quarterstaff",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Versatile"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "9",
        "name": "Sickle",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Light"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "10",
        "name": "Spear",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Thrown", "Versatile"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "11",
        "name": "Battleaxe",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Versatile"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "12",
        "name": "Flail",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": [],
            "rangeType": "Melee"
        }
    },
    {
        "id": "13",
        "name": "Glaive",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Heavy", "Reach", "TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "14",
        "name": "Greataxe",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Heavy", "TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "15",
        "name": "Greatsword",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Heavy", "TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "16",
        "name": "Halberd",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Heavy", "Reach", "TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "17",
        "name": "Lance",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Reach", "Special"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "18",
        "name": "Longsword",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Versatile"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "19",
        "name": "Maul",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Heavy", "TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "20",
        "name": "Morningstar",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": [],
            "rangeType": "Melee"
        }
    },
    {
        "id": "21",
        "name": "Pike",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Heavy", "Reach", "TwoHanded"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "22",
        "name": "Rapier",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Finesse"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "23",
        "name": "Scimitar",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Finesse", "Light"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "24",
        "name": "Shortsword",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Finesse", "Light"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "25",
        "name": "Trident",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Thrown", "Versatile"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "26",
        "name": "War Pick",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": [],
            "rangeType": "Melee"
        }
    },
    {
        "id": "27",
        "name": "Warhammer",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Versatile"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "28",
        "name": "Whip",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Finesse", "Reach"],
            "rangeType": "Melee"
        }
    },
    {
        "id": "29",
        "name": "Light Crossbow",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition", "Loading", "TwoHanded"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "30",
        "name": "Dart",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Finesse", "Thrown"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "31",
        "name": "Shortbow",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition", "TwoHanded"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "32",
        "name": "Sling",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "33",
        "name": "Blowgun",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition", "Loading"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "34",
        "name": "Hand Crossbow",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition", "Light", "Loading"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "35",
        "name": "Heavy Crossbow",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition", "Heavy", "Loading", "TwoHanded"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "36",
        "name": "Longbow",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Ammunition", "Heavy", "TwoHanded"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "37",
        "name": "Net",
        "equipmentType": "Weapon",
        "weaponStats": {
            "weaponProperties": ["Special", "Thrown"],
            "rangeType": "Ranged"
        }
    },
    {
        "id": "38",
        "name": "Padded Armor",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 11,
            "armorType": "Light"
        }
    },
    {
        "id": "39",
        "name": "Leather Armor",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 11,
            "armorType": "Light"
        }
    },
    {
        "id": "40",
        "name": "Studded Leather Armor",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 12,
            "armorType": "Light"
        }
    },
    {
        "id": "41",
        "name": "Hide Armor",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 12,
            "armorType": "Medium"
        }
    },
    {
        "id": "42",
        "name": "Chain Shirt",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 13,
            "armorType": "Medium"
        }
    },
    {
        "id": "43",
        "name": "Scale Mail",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 14,
            "armorType": "Medium"
        }
    },
    {
        "id": "44",
        "name": "Breastplate",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 14,
            "armorType": "Medium"
        }
    },
    {
        "id": "45",
        "name": "Half Plate",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 15,
            "armorType": "Medium"
        }
    },
    {
        "id": "46",
        "name": "Ring Mail",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 14,
            "armorType": "Heavy"
        }
    },
    {
        "id": "47",
        "name": "Chain Mail",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 16,
            "armorType": "Heavy"
        }
    },
    {
        "id": "48",
        "name": "Splint Mail",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 17,
            "armorType": "Heavy"
        }
    },
    {
        "id": "49",
        "name": "Plate Mail",
        "equipmentType": "Armor",
        "armorStats": {
            "baseArmorClass": 18,
            "armorType": "Heavy"
        }
    },
    {
        "id": "50",
        "name": "Shield",
        "equipmentType": "Shield"
    }
];

export function getItemById(id: number): Item | undefined {
    return items.find(item => item.id === id.toString());
}

export function isTwoHandedWeapon(item: Item): boolean {
    return item.equipmentType === 'Weapon' &&
        item.weaponStats?.weaponProperties.includes('TwoHanded') === true;
}

export function canEquipInOffhand(item: Item): boolean {
    if (item.equipmentType === 'Shield') return true;
    if (item.equipmentType !== 'Weapon') return false;

    const weaponProps = item.weaponStats?.weaponProperties || [];
    return weaponProps.includes('Light') && !weaponProps.includes('TwoHanded');
} 