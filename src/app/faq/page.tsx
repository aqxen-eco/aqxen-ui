import * as Accordion from '@radix-ui/react-accordion'
import { LuMinus, LuPlus } from 'react-icons/lu'

const content = [
  {
    title: 'What is AqXen Socials and the AqXen Stream?',
    content:
      "AqXen Socials is a positive social media platform where users post content that illustrates the productive actions they've taken to further their organization's goals. The AqXen Stream is a curated stream of these positive contributions, free from clutter and negativity. Through 'Beams' they receive recognition for their actions and are rewarded with positive reinforcement by their peers.",
  },
  {
    title: 'What are Beams and how do I get them?',
    content:
      "A Beam is a unit of peer to peer recognition. You get Beams when others in your organization's community acknowledge and validate your productive posts. The more your actions shine, the higher your Beam count, and the stronger your reputation amongst your peers.",
  },
  {
    title: "Are there different types of 'Beams'?",
    content:
      "Yes! The 5 Types of Beams we've identified as most significant to meaningful interactions for near or long distance collaboration are the following, in no particular order:\n1. Participation: The degree of activity achieved through various types of virtual and real world presence a member of a community objectively demonstrates. This metric may translate into engagement and interest, as well as likelihood of overall awareness of the community's direction, function, and purpose.\n2. Responsibility: The degree to which a member is able to take on and accomplish key tasks and objectives. This metric may reveal a member's skill set and ability to execute on assigned or volunteered tasks.\n3. Reliability: The degree to which a member delivers tasks whether assigned or volunteered in a timely and consistent manner. This metric may show a member's ability to be counted on and tendency to live up to their commitments.\n4. Transparency: The degree to which a member is willing to show their work, prove their assertions, and empower others with the means to verify terms and actions. This metric can be seen as an objective demonstration of the member's honesty.\n5. Charity: The degree to which a member volunteers or contributes their time, energy, funds, knowledge, network, or their other assets without expecting anything in return. This metric could be viewed as an attempt at encapsulating and recognizing the nature of members to donate and help others.",
  },
  {
    title: 'What are the benefits of unlocking access?',
    content:
      'Unlocking access allows your organization to create a dedicated, private community space (your "Ecosystem"), manage members, issue custom organizational badges, and gain access to detailed analytics on community productivity and engagement as these features are released.',
  },
  {
    title: 'Is AqXen Socials part of the AqXen Ecosystem?',
    content:
      'Yes, AqXen Socials is a foundational element of the AqXen Ecosystem, focusing on translating positive real-world contributions into a verifiable digital reputation score.',
  },
  {
    title: 'Can individuals join without an organization?',
    content:
      'Individuals can apply to join and participate in any public or open-access organization that uses AqXen Socials. To create and manage a dedicated private community, unlocking organizational access is required.',
  },
  {
    title: 'Why sign-up?',
    content:
      'Positivity and productivity are reciprocated. Building a publicly accesible reputation profile around your positive, mutually valued contributions is a meaningful way of becoming part of an ecosystem striving to race to the top, creating networks of like-minded people willing to work towards furthering their shared interests. As the ecosystem grows organizations within it and outside of it will incentivize AqXen Ecosystem members in their own ways, leading to a community of increasing and growing value.',
  },
  {
    title: "Do 'Beams' have any value?",
    content:
      'Yes! More utility will be given to Beams as we introduce further decentralization and open up more systems within AqXen Eco, introducing governance features, liquidity provision, special access and unlocks, as well as rewards tied to staking and revenue generation. We value our community!',
  },
  {
    title: 'Where does our reputation live?',
    content:
      'We leverage blockchain technology to ensure we are building on a solid, stable, and secure foundation giving us the ability to own who we are, and never lose our accomplishments or be censored.\nYou are responsible for who you become.\nCurrently, we believe the Vaulta Network aligns best with our values and meets our security and scaling needs.\nAqXen Eco is open-source and auditable.\nWe believe in holding each other accountable and building our community together.',
  },
]

export default function FaqPage() {
  return (
    <header className="max-w-container-lg relative mx-auto overflow-hidden px-4 py-16">
      <div className="space-y-6 md:text-center">
        <h1 className="text-display-1 max-md:text-display-2 text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-body-1 text-gray-3">
          Find answers to common questions about AqXen Socials.
        </p>
      </div>
      <Accordion.Root
        type="multiple"
        className="max-w-container-md mx-auto my-16"
      >
        {content.map((item, index) => (
          <Accordion.Item
            key={index}
            value={`item-${index}`}
            className="border-gray-2 border-b"
          >
            <Accordion.Header>
              <Accordion.Trigger className="text-body-1 group flex w-full cursor-pointer items-center justify-between py-4 text-left text-white">
                {item.title}
                <LuPlus className="size-5 shrink-0 group-data-[state=open]:hidden" />
                <LuMinus className="size-5 shrink-0 group-data-[state=closed]:hidden" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="text-body-2 text-gray-3 space-y-3 pb-4">
              {item.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </header>
  )
}
