'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/database'
import BrandDialog from './brand-dialog'
import { Button } from '@/components/ui/button'
import { Edit, Eye } from 'lucide-react'

type Brand = Database['public']['Tables']['brands']['Row']

interface BrandsTableProps {
  brands: Brand[]
}

export default function BrandsTable({ brands }: BrandsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Website</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No brands found
              </TableCell>
            </TableRow>
          ) : (
            brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">
                  <Link href={`/brands/${brand.id}`} className="hover:underline">
                    {brand.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {brand.industry && (
                    <Badge variant="outline">{brand.industry}</Badge>
                  )}
                </TableCell>
                <TableCell>{brand.contact_email}</TableCell>
                <TableCell>
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {brand.website}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/brands/${brand.id}`}>
                      <Button variant="ghost" size="icon" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <BrandDialog brand={brand}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </BrandDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}