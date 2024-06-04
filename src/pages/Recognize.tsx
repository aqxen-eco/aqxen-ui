import { Box } from '@/components/ui/Box'
import { Button } from '@/components/ui/Button'
import * as Form from '@/components/ui/Form'

export function Recognize() {
  return (
    <div className="mx-auto max-w-container-md px-4 pb-8">
      <header className="my-8">
        <h1 className="text-title-1 text-white">Recognize</h1>
        <p className="mt-1 text-body-2 text-gray-3">
          Your recognition will be official because you hold an official account.
        </p>
      </header>

      <Box>
        <form className="space-y-16">
          <Form.Field>
            <Form.Label htmlFor="message">Who do you want to recognize?</Form.Label>
            <Form.TextArea id="message" placeholder="Write your message" rows={4} />
          </Form.Field>

          <Button type="submit" variant="primary" size="lg">
            Post
          </Button>
        </form>
      </Box>
    </div>
  )
}
