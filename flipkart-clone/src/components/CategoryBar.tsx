import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/supabase";

export function CategoryBar() {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (isLoading) {
    return (
      <div className="bg-card shadow-card">
        <div className="container mx-auto py-4">
          <div className="flex gap-8 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full" />
                <div className="w-16 h-3 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card shadow-card">
      <div className="container mx-auto py-4">
        <div className="flex gap-6 lg:gap-10 overflow-x-auto pb-2 px-4 justify-start lg:justify-center">
          <Link
            to="/?category=all"
            className={`flipkart-category-card shrink-0 ${
              currentCategory === 'all' ? 'text-primary' : 'text-foreground'
            }`}
          >
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-xs lg:text-sm font-medium whitespace-nowrap">All</span>
          </Link>
          
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={`/?category=${category.slug}`}
              className={`flipkart-category-card shrink-0 ${
                currentCategory === category.slug ? 'text-primary' : 'text-foreground'
              }`}
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs lg:text-sm font-medium whitespace-nowrap">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
