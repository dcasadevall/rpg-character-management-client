'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { characterService, Character } from '../../api/characterService';
import Link from 'next/link';
import Image from 'next/image';

export default function CharacterDetail() {
    const router = useRouter();
    const params = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<'mainHand' | 'offHand' | 'armor' | null>(null);
    const [showEquipmentPopover, setShowEquipmentPopover] = useState(false);

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
                    <div className="md:w-1/3 flex items-center justify-center p-6">
                        <div className="relative w-full max-w-md aspect-square">
                            <Image
                                src={getImagePath()}
                                alt={`${character.race} ${character.class} character portrait`}
                                className="object-cover rounded-lg"
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                priority
                            />
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
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Strength:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">{getStatValue('Strength')}</span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Dexterity:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">{getStatValue('Dexterity')}</span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Constitution:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">{getStatValue('Constitution')}</span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Intelligence:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">{getStatValue('Intelligence')}</span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Wisdom:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">{getStatValue('Wisdom')}</span>
                                </div>
                                <div>
                                    <span className="font-semibold dark:text-gray-300">Charisma:</span>{' '}
                                    <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-200">{getStatValue('Charisma')}</span>
                                </div>
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
                                        {character.equipment?.mainHand && (
                                            <Image
                                                src={getItemImagePath(character.equipment.mainHand)}
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
                                        {character.equipment?.armor && (
                                            <Image
                                                src={getItemImagePath(character.equipment.armor)}
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
                                        {character.equipment?.offHand && (
                                            <Image
                                                src={getItemImagePath(character.equipment.offHand)}
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
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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

                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                            {/* Weapons (1-37) - only show for main hand and off hand */}
                            {(selectedSlot === 'mainHand' || selectedSlot === 'offHand') && (
                                Array.from({ length: 37 }, (_, i) => i + 1).map((id) => (
                                    <div
                                        key={`weapon-${id}`}
                                        className="relative aspect-square cursor-pointer"
                                        onClick={() => handleItemSelect(id, 'weapon')}
                                    >
                                        <Image
                                            src={getItemImagePath(id)}
                                            alt={`Item ${id}`}
                                            className="object-contain p-2"
                                            fill
                                            sizes="(max-width: 768px) 50px, 75px"
                                        />
                                    </div>
                                ))
                            )}

                            {/* Armor (38-49) - only show for armor slot */}
                            {selectedSlot === 'armor' && (
                                Array.from({ length: 12 }, (_, i) => i + 38).map((id) => (
                                    <div
                                        key={`armor-${id}`}
                                        className="relative aspect-square cursor-pointer"
                                        onClick={() => handleItemSelect(id, 'armor')}
                                    >
                                        <Image
                                            src={getItemImagePath(id)}
                                            alt={`Item ${id}`}
                                            className="object-contain p-2"
                                            fill
                                            sizes="(max-width: 768px) 50px, 75px"
                                        />
                                    </div>
                                ))
                            )}

                            {/* Shield (50) - only show for off hand */}
                            {selectedSlot === 'offHand' && (
                                <div
                                    className="relative aspect-square cursor-pointer"
                                    onClick={() => handleItemSelect(50, 'shield')}
                                >
                                    <Image
                                        src={getItemImagePath(50)}
                                        alt="Item 50"
                                        className="object-contain p-2"
                                        fill
                                        sizes="(max-width: 768px) 50px, 75px"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 