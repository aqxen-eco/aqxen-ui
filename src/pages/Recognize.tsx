import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { MdOutlineClose } from 'react-icons/md'

import { Avatar } from '@/components/ui/Avatar'
import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import { AvatarColor, randomVariant } from '@/styles/avatar'

const dataMembers = [
  {
    account: 'hyogasereriou',
    color: randomVariant()
  },
  {
    account: 'eduardojaegr',
    color: randomVariant()
  },
  {
    account: 'eosdpongilo2',
    color: randomVariant()
  },
  {
    account: 'eosdpongilo1',
    color: randomVariant()
  },
  {
    account: 'rogertaule12',
    color: randomVariant()
  },
  {
    account: 'detroitfunds',
    color: randomVariant()
  }
]

interface Member {
  account: string
  color: AvatarColor
  selected?: boolean
}

export function Recognize() {
  const [members, setMembers] = useState<Member[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [suggestions, setSuggestions] = useState<Member[] | null>(null)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1)

  function addMember(member: Member) {
    setMembers((state) => {
      return [...state, member]
    })
  }

  function removeMember(index: number) {
    setMembers((state) => {
      const newState = [...state]
      newState.splice(index, 1)
      return newState
    })
  }

  function onSearch() {
    const inputValue = inputRef.current?.value.toLowerCase()

    if (inputValue && inputValue.length > 0) {
      const memberSuggestions = dataMembers.map((dataMember) => {
        return {
          ...dataMember,
          selected: members.some((member) => member.account === dataMember.account)
        }
      })

      setSuggestions(memberSuggestions)
    } else {
      setSuggestions([])
    }

    setSelectedSuggestionIndex(-1)
  }

  function onClose() {
    if (inputRef.current !== document.activeElement) {
      setSuggestions(null)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!suggestions) {
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedSuggestionIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : suggestions?.length - 1))
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedSuggestionIndex((prevIndex) => (prevIndex < suggestions?.length - 1 ? prevIndex + 1 : 0))
    } else if (event.key === 'Enter' && selectedSuggestionIndex !== -1) {
      event.preventDefault()
      addMember(suggestions[selectedSuggestionIndex])
    }
  }

  useEffect(() => {
    document.addEventListener('click', onClose)

    return () => {
      document.removeEventListener('click', onClose)
    }
  }, [])

  return (
    <div className="mx-auto max-w-container-md px-4">
      <header className="my-8">
        <h1 className="text-title-1 text-white">Recognize</h1>
        <p className="mt-1 text-body-2 text-gray-3">
          Your recognition will be official because you hold an official account.
        </p>
      </header>

      <Box>
        <form>
          <div className="space-y-2 border-b border-gray-3 pb-4 focus-within:border-white">
            <label htmlFor="searchMembers" className="block text-title-2 text-white">
              Who do you want to recognize?
            </label>

            {members.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {members.map((member, index) => (
                  <li key={member.account}>
                    <Button variant="secondary" square onClick={() => removeMember(index)}>
                      <Avatar size="sm" color={member.color}>
                        {member.account.slice(0, 2)}
                      </Avatar>
                      {member.account}
                      <MdOutlineClose className="h-6 w-6" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <search className="relative">
              <input
                ref={inputRef}
                id="searchMembers"
                type="search"
                className="body-2 block w-full bg-transparent py-2 placeholder:text-gray-3 focus:outline-none"
                placeholder="Search members"
                onChange={onSearch}
                onFocus={onSearch}
                onBlur={onClose}
                onKeyDown={handleKeyDown}
              />
              {suggestions && (
                <section className="absolute left-0 top-10 z-10 max-h-52 w-full overflow-y-auto rounded-2xl border border-gray-2 bg-gray-1 p-2 shadow-lg">
                  {suggestions.length > 0 ? (
                    <ul className="space-y-1">
                      {suggestions.map((member, index) => (
                        <li key={member.account}>
                          <Button
                            square
                            variant="secondary"
                            onClick={() => addMember(member)}
                            disabled={member.selected}
                            className={`w-full border-none ${index === selectedSuggestionIndex ? 'text-red-500' : ''}`}
                          >
                            <Avatar size="sm" color={member.color}>
                              {member.account.slice(0, 2)}
                            </Avatar>
                            {member.account}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <output className="block py-6 text-center text-body-2">No results content</output>
                  )}
                </section>
              )}
            </search>
          </div>

          <Button type="submit" variant="primary" size="lg">
            Post
          </Button>
        </form>
      </Box>
    </div>
  )
}
