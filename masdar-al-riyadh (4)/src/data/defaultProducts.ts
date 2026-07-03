import { Product, Category } from '../types';

export const defaultCategories: Category[] = [
  {
    id: 'timber-wood',
    name: 'Timber & Hardwoods',
    description: 'Sustainably sourced Romanian white wood, premium kiln-dried hardwoods, commercial plywood, and high-density MDF boards for structural joinery.',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'structural-steel',
    name: 'Structural Steel & Mesh',
    description: 'High-tensile deformed reinforcing steel rebars, structural columns, steel angles, and welded wire meshes for concrete reinforcement.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'plumbing-pipes',
    name: 'Piping & Plumbing Solutions',
    description: 'Certified PPR, PVC, and CPVC piping, valves, and water storage connection systems engineered for everlasting hydraulic integrity.',
    image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'fasteners-safety',
    name: 'Fasteners & Safety PPE',
    description: 'Industrial-grade bolts, drywall screws, concrete nails, premium hand tools, and certified professional protective wear (safety shoes, helmets, and vests).',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80'
  }
];

export const defaultProducts: Product[] = [];
