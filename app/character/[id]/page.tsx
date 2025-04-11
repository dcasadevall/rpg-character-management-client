'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { characterService, Character } from '../../api/characterService';
import Link from 'next/link';
import Image from 'next/image';
import { items, getItemById, canEquipInOffhand } from '../../api/items';

export default function CharacterDetail() {
    const router = useRouter();
    const params = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<'mainHand' | 'offHand' | 'armor' | null>(null);
    const [showEquipmentPopover, setShowEquipmentPopover] = useState(false);
    const [floatingNumbers, setFloatingNumbers] = useState<Array<{ id: number, amount: number, isHeal: boolean }>>([]);
    const popoverRef = useRef<HTMLDivElement>(null);
    const nextId = useRef(0);

    useEffect(() => {
        const fetchCharacter = async () => {
            if (!params.id) {
                setError('No character ID provided');
                setLoading(false);
                return;
            }

            try {
                const data = await characterService.getCharacter(params.id as string);
                setCharacter(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch character:', err);
                setError('Failed to load character. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, [params.id]);

    // Handle click outside popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setShowEquipmentPopover(false);
                setSelectedSlot(null);
            }
        };

        // Handle Escape key
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowEquipmentPopover(false);
                setSelectedSlot(null);
            }
        };

        if (showEquipmentPopover) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [showEquipmentPopover]);

    // Get image path for character portrait
    const getImagePath = () => {
        if (!character) return '';

        const race = character.race.toLowerCase();
        const characterClass = character.class.toLowerCase();

        return character.subrace
            ? `/character-creation/${race}-${character.subrace.toLowerCase()}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
    };

    // Helper function to get a character's stat value
    const getStatValue = (statName: string): number => {
        if (!character || !character.abilityScores) return 0;
        return character.abilityScores[statName as keyof typeof character.abilityScores] || 0;
    };

    // Helper function to get a character's currency value
    const getCurrencyValue = (currencyType: string): number => {
        if (!character) return 0;

        // Check if we have wealth object with the currency property
        if (character.wealth && typeof character.wealth === 'object') {
            // Check with lowercase currencyType as a key (e.g., 'gold')
            const lowerCaseKey = currencyType.toLowerCase() as keyof typeof character.wealth;
            if (lowerCaseKey in character.wealth && typeof character.wealth[lowerCaseKey] === 'number') {
                return character.wealth[lowerCaseKey];
            }

            // Check with capitalized currencyType as a key (e.g., 'Gold')
            const capitalizedKey = currencyType.charAt(0).toUpperCase() + currencyType.slice(1).toLowerCase() as keyof typeof character.wealth;
            if (capitalizedKey in character.wealth && typeof character.wealth[capitalizedKey] === 'number') {
                return character.wealth[capitalizedKey];
            }
        }

        // If no currency found, return 0
        return 0;
    };

    // Get item image path
    const getItemImagePath = (id: number) => {
        return `/items/${id}.png`;
    };

    // Handle equipment slot click
    const handleEquipmentSlotClick = (slot: 'mainHand' | 'offHand' | 'armor') => {
        setSelectedSlot(slot);
        setShowEquipmentPopover(true);
    };

    // Handle item selection
    const handleItemSelect = async (itemId: number, itemType: 'weapon' | 'armor' | 'shield') => {
        if (!character || !selectedSlot) return;

        const item = getItemById(itemId);
        if (!item) {
            console.error('Item not found:', itemId);
            return;
        }

        // Check if trying to equip a two-handed weapon in offhand
        if (selectedSlot === 'offHand' && !canEquipInOffhand(item)) {
            alert('This weapon cannot be equipped in the offhand slot');
            return;
        }

        try {
            let updatedCharacter;
            if (itemType === 'shield') {
                // Shields always go to offhand
                updatedCharacter = await characterService.equipItem(
                    character.id!,
                    'shield',
                    itemId
                );
            } else if (itemType === 'weapon') {
                // For weapons, specify if it's going to the offhand
                updatedCharacter = await characterService.equipItem(
                    character.id!,
                    'weapon',
                    itemId,
                    selectedSlot === 'offHand'
                );
            } else {
                // Armor goes to armor slot
                updatedCharacter = await characterService.equipItem(
                    character.id!,
                    'armor',
                    itemId
                );
            }
            setCharacter(updatedCharacter);
            setShowEquipmentPopover(false);
            setSelectedSlot(null);
        } catch (err) {
            console.error('Failed to equip item:', err);
            alert('Failed to equip item. Please try again.');
        }
    };

    // Handle character deletion
    const handleDelete = async () => {
        if (!character || !character.id) return;

        if (!window.confirm('Are you sure you want to delete this character?')) {
            return;
        }

        try {
            await characterService.deleteCharacter(character.id);
            router.push('/characters');
        } catch (err) {
            console.error('Failed to delete character:', err);
            alert('Failed to delete character. Please try again.');
        }
    };

    const showFloatingNumber = (amount: number, isHeal: boolean) => {
        const id = nextId.current++;
        setFloatingNumbers(prev => [...prev, { id, amount, isHeal }]);
        setTimeout(() => {
            setFloatingNumbers(prev => prev.filter(n => n.id !== id));
        }, 1000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="text-center py-8 dark:bg-gray-900 dark:text-white">
                <p className="text-red-500 mb-4 dark:text-red-400">{error || 'Character not found'}</p>
                <Link
                    href="/characters"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                    Back to Characters
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 dark:bg-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">{character.name}</h1>
                <div className="space-x-4">
                    <Link
                        href="/characters"
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Back to Characters
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                        Delete Character
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden dark:bg-gray-800">
                <div className="md:flex">
                    {/* Character Portrait */}
                    <div className="md:w-1/3 flex flex-col items-center justify-center p-6">
                        {/* Health UI */}
                        <div className="flex justify-center items-center gap-4 mb-4">
                            {/* Healing Button */}
                            <button
                                onClick={async () => {
                                    const healAmount = Math.floor(Math.random() * 10) + 1;
                                    try {
                                        const response = await fetch(`/api/proxy/characters/${character.id}/stats/hitpoints`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ delta: healAmount }),
                                        });
                                        if (response.ok) {
                                            const updatedCharacter = await characterService.getCharacter(character.id!);
                                            setCharacter(updatedCharacter);
                                            // Show floating heal number
                                            showFloatingNumber(healAmount, true);
                                        }
                                    } catch (err) {
                                        console.error('Failed to heal:', err);
                                    }
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-transform hover:scale-110"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>

                            {/* Health Display */}
                            <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {character.hitPoints || 0}/{character.maxHitPoints || 0}
                                </span>
                            </div>

                            {/* Damage Button */}
                            <button
                                onClick={async () => {
                                    const damageAmount = -(Math.floor(Math.random() * 10) + 1);
                                    try {
                                        const response = await fetch(`/api/proxy/characters/${character.id}/stats/hitpoints`, {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({ delta: damageAmount }),
                                        });
                                        if (response.ok) {
                                            const updatedCharacter = await characterService.getCharacter(character.id!);
                                            setCharacter(updatedCharacter);
                                            // Add shake animation
                                            const portrait = document.querySelector('.character-portrait');
                                            if (portrait) {
                                                portrait.classList.add('shake');
                                                setTimeout(() => {
                                                    portrait.classList.remove('shake');
                                                }, 500);
                                            }
                                            // Show floating damage number
                                            showFloatingNumber(Math.abs(damageAmount), false);
                                        }
                                    } catch (err) {
                                        console.error('Failed to damage:', err);
                                    }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-transform hover:scale-110"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                </svg>
                            </button>
                        </div>

                        <div className="relative w-full max-w-md aspect-square">
                            <Image
                                src={getImagePath()}
                                alt={`${character.race} ${character.class} character portrait`}
                                className="object-cover rounded-lg character-portrait"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority
                            />
                            {/* Floating Numbers */}
                            {floatingNumbers.map(({ id, amount, isHeal }) => (
                                <div
                                    key={id}
                                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl ${isHeal ? 'text-green-500' : 'text-red-500'
                                        } floating-number`}
                                >
                                    {isHeal ? '+' : '-'}{amount}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Character Details */}
                    <div className="md:w-2/3 p-6 dark:text-gray-200">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2 dark:text-white">{character.name}</h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300">
                                {character.race} {character.subrace ? `(${character.subrace})` : ''} {character.class}
                            </p>

                            {/* Hit Points */}
                            {character.hitPoints !== undefined && character.maxHitPoints !== undefined && (
                                <div className="mt-2">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        HP: {character.hitPoints}/{character.maxHitPoints}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Attributes Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700 dark:text-gray-200">Attributes</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map((attr) => (
                                    <div key={attr} className="flex justify-between items-center">
                                        <span className="font-semibold dark:text-gray-300 mr-2">{attr}:</span>{' '}
                                        <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                            {getStatValue(attr)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Combat Stats Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700 dark:text-gray-200">Combat Stats</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Armor Class:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                        {character.armorClass || 10}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Proficiency:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                        +{character.proficiencyBonus || 2}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Weapon Modifier:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">
                                        {character.weaponDamageModifier == 1 ? "DEX" : "STR"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Equipment Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2 dark:border-gray-700 dark:text-gray-200">Equipment</h3>

                            {/* Currencies */}
                            <div className="mb-4">
                                <h4 className="text-md font-medium mb-2 dark:text-gray-300">Currency</h4>
                                <div className="flex flex-wrap gap-2">
                                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center dark:bg-yellow-900 dark:text-yellow-200">
                                        <span className="text-yellow-600 font-bold mr-1 dark:text-yellow-400">⦿</span> {getCurrencyValue('gold')} gold
                                    </div>

                                    <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full flex items-center dark:bg-gray-700 dark:text-gray-200">
                                        <span className="text-gray-500 font-bold mr-1 dark:text-gray-400">⦿</span> {getCurrencyValue('silver')} silver
                                    </div>

                                    <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full flex items-center dark:bg-amber-900 dark:text-amber-200">
                                        <span className="text-amber-600 font-bold mr-1 dark:text-amber-400">⦿</span> {getCurrencyValue('copper')} copper
                                    </div>
                                </div>
                            </div>

                            {/* Equipped Items */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-md font-medium dark:text-gray-300">Equipped Items</h4>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Main Hand */}
                                    <div
                                        className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600 cursor-pointer"
                                        onClick={() => handleEquipmentSlotClick('mainHand')}
                                    >
                                        {character.equipment && character.equipment.mainHandId > 0 && (
                                            <Image
                                                src={getItemImagePath(character.equipment.mainHandId)}
                                                alt="Main Hand"
                                                className="object-contain p-2"
                                                fill
                                                sizes="(max-width: 768px) 100px, 150px"
                                            />
                                        )}
                                    </div>

                                    {/* Armor */}
                                    <div
                                        className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600 cursor-pointer"
                                        onClick={() => handleEquipmentSlotClick('armor')}
                                    >
                                        {character.equipment && character.equipment.armorId > 0 && (
                                            <Image
                                                src={getItemImagePath(character.equipment.armorId)}
                                                alt="Armor"
                                                className="object-contain p-2"
                                                fill
                                                sizes="(max-width: 768px) 100px, 150px"
                                            />
                                        )}
                                    </div>

                                    {/* Off Hand */}
                                    <div
                                        className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600 cursor-pointer"
                                        onClick={() => handleEquipmentSlotClick('offHand')}
                                    >
                                        {character.equipment && character.equipment.offHandId > 0 && (
                                            <Image
                                                src={getItemImagePath(character.equipment.offHandId)}
                                                alt="Off Hand"
                                                className="object-contain p-2"
                                                fill
                                                sizes="(max-width: 768px) 100px, 150px"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Equipment Selection Popover */}
            {showEquipmentPopover && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        ref={popoverRef}
                        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold dark:text-white">
                                Select {selectedSlot === 'mainHand' ? 'Weapon' : selectedSlot === 'armor' ? 'Armor' : 'Off-hand Item'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowEquipmentPopover(false);
                                    setSelectedSlot(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {items
                                .filter(item => {
                                    // Filter out items that can't be equipped in the selected slot
                                    if (selectedSlot === 'offHand' && !canEquipInOffhand(item)) {
                                        return false;
                                    }

                                    // Filter out currently equipped items
                                    if (character.equipment) {
                                        if (selectedSlot === 'mainHand' && character.equipment.mainHandId === parseInt(item.id)) {
                                            return false;
                                        }
                                        if (selectedSlot === 'armor' && character.equipment.armorId === parseInt(item.id)) {
                                            return false;
                                        }
                                        if (selectedSlot === 'offHand' && character.equipment.offHandId === parseInt(item.id)) {
                                            return false;
                                        }
                                    }

                                    // Filter items by type
                                    if (selectedSlot === 'mainHand' || selectedSlot === 'offHand') {
                                        return item.equipmentType === 'Weapon' || item.equipmentType === 'Shield';
                                    } else if (selectedSlot === 'armor') {
                                        return item.equipmentType === 'Armor';
                                    }
                                    return false;
                                })
                                .map(item => (
                                    <div
                                        key={`item-${item.id}`}
                                        className="relative aspect-square cursor-pointer"
                                        onClick={() => handleItemSelect(parseInt(item.id), item.equipmentType.toLowerCase() as 'weapon' | 'armor' | 'shield')}
                                    >
                                        <Image
                                            src={getItemImagePath(parseInt(item.id))}
                                            alt={`Item ${item.id}`}
                                            className="object-contain p-2"
                                            fill
                                            sizes="(max-width: 768px) 50px, 75px"
                                        />
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Add this to your existing styles */}
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes floatUp {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
                .floating-number {
                    position: absolute;
                    font-weight: bold;
                    font-size: 1.5rem;
                    pointer-events: none;
                    animation: floatUp 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
} 