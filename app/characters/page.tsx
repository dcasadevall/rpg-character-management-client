'use client';

import { useState, useEffect } from 'react';
import { characterService, Character } from '../api/characterService';
import Link from 'next/link';

export default function ViewCharacters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get image path for character portrait
    const getImagePath = (character: Character) => {
        const { race, subrace, class: characterClass } = character;
        return subrace
            ? `/character-creation/${race}-${subrace}-${characterClass}.png`
            : `/character-creation/${race}-${characterClass}.png`;
    };

    // Load characters on component mount
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const data = await characterService.getCharacters();
                setCharacters(data);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch characters:', err);
                setError('Failed to load characters. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCharacters();
    }, []);

    // Handle character deletion
    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this character?')) {
            return;
        }

        try {
            await characterService.deleteCharacter(id);
            setCharacters(characters.filter(char => char.id !== id));
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

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (characters.length === 0) {
        return (
            <div className="text-center py-12">
                <h1 className="text-3xl font-bold mb-4">Your Characters</h1>
                <p className="mb-6">You haven't created any characters yet.</p>
                <Link
                    href="/create"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Create Your First Character
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Your Characters</h1>
                <Link
                    href="/create"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                    Create New Character
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map(character => (
                    <div
                        key={character.id}
                        className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                    >
                        <div className="relative aspect-square">
                            <img
                                src={getImagePath(character)}
                                alt={`${character.race} ${character.class}`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{character.name}</h2>
                            <p className="text-gray-700">
                                {character.race} {character.subrace ? `(${character.subrace})` : ''} {character.class}
                            </p>

                            <div className="mt-3 grid grid-cols-3 gap-1 text-sm">
                                <p>STR: {character.strength}</p>
                                <p>DEX: {character.dexterity}</p>
                                <p>CON: {character.constitution}</p>
                                <p>INT: {character.intelligence}</p>
                                <p>WIS: {character.wisdom}</p>
                                <p>CHA: {character.charisma}</p>
                            </div>

                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={() => handleDelete(character.id!)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 