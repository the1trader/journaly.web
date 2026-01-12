'use client'

import * as React from 'react'
import { LayoutDashboard, Newspaper, NotebookTabs, LogOut, Settings } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { authService } from '@/services/auth'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'

const navItems = [
  {
    title: 'News Calendar',
    url: '/calendar',
    icon: Newspaper,
  },
  {
    title: 'Trade Journal',
    url: '/journal',
    icon: NotebookTabs,
  },
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authService.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="h-20 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shrink-0">J</div>
          <div className="flex flex-col truncate">
            <span className="text-lg font-black tracking-tight text-slate-900 uppercase italic leading-none">Journaly</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">From Clicks to Clarity</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
