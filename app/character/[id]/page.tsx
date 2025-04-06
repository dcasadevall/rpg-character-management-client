'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { characterService, Character } from '../../api/characterService';
import Link from 'next/link';

export default function CharacterDetail() {
    const router = useRouter();
    const params = useParams();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

        const { race, subrace, class: characterClass } = character;
        return subrace
            ? `/character-creation/${race}-${subrace}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
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
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !character) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error || 'Character not found'}</p>
                <Link
                    href="/characters"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Back to Characters
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{character.name}</h1>
                <div className="space-x-4">
                    <Link
                        href="/characters"
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Back to Characters
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete Character
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="md:flex">
                    {/* Character Portrait */}
                    <div className="md:w-1/3">
                        <div className="relative aspect-square">
                            <img
                                src={getImagePath()}
                                alt={`${character.race} ${character.class} character portrait`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Character Details */}
                    <div className="md:w-2/3 p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">{character.name}</h2>
                            <p className="text-lg text-gray-700">
                                {character.race} {character.subrace ? `(${character.subrace})` : ''} {character.class}
                            </p>
                        </div>

                        {/* Attributes Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2">Attributes</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <span className="font-semibold">Strength:</span> {character.strength}
                                </div>
                                <div>
                                    <span className="font-semibold">Dexterity:</span> {character.dexterity}
                                </div>
                                <div>
                                    <span className="font-semibold">Constitution:</span> {character.constitution}
                                </div>
                                <div>
                                    <span className="font-semibold">Intelligence:</span> {character.intelligence}
                                </div>
                                <div>
                                    <span className="font-semibold">Wisdom:</span> {character.wisdom}
                                </div>
                                <div>
                                    <span className="font-semibold">Charisma:</span> {character.charisma}
                                </div>
                            </div>
                        </div>

                        {/* Equipment Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3 border-b pb-2">Equipment</h3>
                            <div className="flex items-center">
                                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                                    <span className="text-yellow-600 font-bold mr-1">⦿</span> {character.gold || 0} gold pieces
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 