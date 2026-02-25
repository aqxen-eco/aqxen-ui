import {
  HeaderAdmin,
  HeaderAdminMenu,
  HeaderAdminTitle,
} from '@/components/header-admin'
import { Link } from '@/components/ui/link'

type BadgesAutomationProps = {
  children: React.ReactNode
}

export default async function BadgesAutomation({
  children,
}: BadgesAutomationProps) {
  return (
    <>
      <HeaderAdmin>
        <HeaderAdminMenu activeHref="/admin/badges-automation" />
        <HeaderAdminTitle
          title="Badges Automation"
          tooltip="Monitor your active automation rules that instantly distribute badges to users when they hit certain milestones."
        >
          <Link href="/admin/new-badge-automation" variant="primary" size="md">
            New automation rule
          </Link>
        </HeaderAdminTitle>
      </HeaderAdmin>
      <div className="max-w-container-lg mx-auto min-h-[calc(100vh-24rem)] px-4 pb-8">
        {children}
      </div>
    </>
  )
}
