import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react'

interface SearchWithSuggestionsProps {}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = () => {
  const [query, setQuery] = useState<string>('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1)

  // Simulated data for suggestions
  const allSuggestions: string[] = ['apple', 'banana', 'orange', 'grape', 'pear']

  // Function to handle input change
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const userInput = event.target.value
    setQuery(userInput)

    // Filter suggestions based on user input
    const filteredSuggestions = allSuggestions.filter(
      (suggestion) => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    )

    setSuggestions(filteredSuggestions)
    setSelectedSuggestionIndex(-1)
  }

  // Function to handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setSuggestions([])
  }

  // Function to handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      // Move selection up
      setSelectedSuggestionIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1))
    } else if (event.key === 'ArrowDown') {
      // Move selection down
      setSelectedSuggestionIndex((prevIndex) => (prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0))
    } else if (event.key === 'Enter' && selectedSuggestionIndex !== -1) {
      // Handle Enter key press to select suggestion
      handleSuggestionClick(suggestions[selectedSuggestionIndex])
    }
  }

  // Clear suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setSuggestions([])
    }

    document.addEventListener('click', handleOutsideClick)

    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="text-black"
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={index === selectedSuggestionIndex ? 'text-red-500' : ''}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchWithSuggestions
