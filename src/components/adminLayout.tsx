"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TagIcon,
} from "@heroicons/react/24/outline"

const navigation = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Catálogo",
    items: [
      {
        name: "Productos",
        href: "/dashboard/catalogo/productos",
        icon: ShoppingBagIcon,
      },
      {
        name: "Servicios",
        href: "/dashboard/catalogo/servicios",
        icon: WrenchScrewdriverIcon,
      },
      {
        name: "Reparaciones Frecuentes",
        href: "/dashboard/catalogo/reparaciones-frecuentes",
        icon: ClipboardDocumentListIcon,
      },
    ],
  },
  {
    name: "Clientes",
    href: "/dashboard/clientes",
    icon: UsersIcon,
  },
  {
    name: "Cupones",
    href: "/dashboard/cupones",
    icon: TagIcon,
  },
  {
    name: "Reportes",
    href: "/dashboard/reportes",
    icon: ChartBarIcon,
  },
  {
    name: "Configuración",
    href: "/dashboard/configuracion",
    icon: Cog6ToothIcon,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-2xl font-bold">arregla.mx</h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.items ? (
                      <div>
                        <div className="px-3 py-2 text-sm font-medium text-gray-500">
                          {item.name}
                        </div>
                        <div className="space-y-1">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`
                                group flex items-center rounded-md px-3 py-2 text-sm font-medium
                                ${
                                  pathname === subItem.href
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }
                              `}
                            >
                              <subItem.icon
                                className={`
                                  mr-3 h-6 w-6 flex-shrink-0
                                  ${
                                    pathname === subItem.href
                                      ? "text-gray-500"
                                      : "text-gray-400 group-hover:text-gray-500"
                                  }
                                `}
                                aria-hidden="true"
                              />
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`
                          group flex items-center rounded-md px-3 py-2 text-sm font-medium
                          ${
                            pathname === item.href
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <item.icon
                          className={`
                            mr-3 h-6 w-6 flex-shrink-0
                            ${
                              pathname === item.href
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500"
                            }
                          `}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col md:pl-64">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 