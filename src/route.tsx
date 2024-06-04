import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'

import { AppLayout } from '@/components/layouts/AppLayout'
import { Home } from '@/pages/Home'
import { Profile } from '@/pages/Profile'
import { Recognize } from '@/pages/Recognize'

export const route = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AppLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/recognize" element={<Recognize />} />
      <Route path="/profile/:user" element={<Profile />} />
    </Route>
  )
)
