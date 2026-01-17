import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, ChevronDown, Menu, X, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCartItems, getCategories } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartItems,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const cartItemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="flipkart-header sticky top-0 z-50">
      <div className="container mx-auto">
        {/* Main Header */}
        <div className="flex items-center gap-4 py-3 px-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-primary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex flex-col items-center shrink-0">
            <span className="text-xl font-bold italic text-primary-foreground">Flipkart</span>
            <span className="text-[10px] text-primary-foreground/80 italic flex items-center gap-0.5">
              Explore <span className="text-accent">Plus</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden sm:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flipkart-search w-full py-2.5 pl-4 pr-12 rounded-sm text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/" className="text-primary-foreground font-medium hover:opacity-80 transition-opacity">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-primary-foreground font-medium hover:opacity-80 transition-opacity">
                Categories <ChevronDown size={16} />
              </button>
              <div className="absolute top-full left-0 mt-2 bg-card shadow-hover rounded-sm py-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link
                  to="/?category=all"
                  className="block px-4 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  All Products
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/?category=${cat.slug}`}
                    className="block px-4 py-2 text-foreground hover:bg-muted transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/wishlist" className="text-primary-foreground font-medium hover:opacity-80 transition-opacity">
              Wishlist
            </Link>
            <Link to="/orders" className="text-primary-foreground font-medium hover:opacity-80 transition-opacity">
              Orders
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 text-primary-foreground font-medium hover:opacity-80 transition-opacity">
                  <UserIcon size={20} />
                  <span className="hidden xl:inline max-w-[100px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown size={16} />
                </button>
                <div className="absolute top-full right-0 mt-2 bg-card shadow-hover rounded-sm py-2 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-2 border-b text-xs text-muted-foreground break-words">
                    Hello, <br />
                    <span className="text-foreground font-medium text-sm">{user.email}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-foreground hover:bg-muted transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-white text-primary hover:bg-white/90 font-medium px-8 rounded-sm h-8">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Cart */}
          <Link to="/cart" className="relative ml-auto lg:ml-0">
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
              <ShoppingCart size={20} />
              <span className="hidden sm:inline font-medium">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="px-4 pb-3 sm:hidden">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flipkart-search w-full py-2 pl-4 pr-12 rounded-sm text-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
            >
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border animate-slide-in">
            <nav className="flex flex-col py-4">
              <Link
                to="/"
                className="px-4 py-3 text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/?category=all"
                className="px-4 py-3 text-foreground hover:bg-muted font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Products
              </Link>
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/?category=${cat.slug}`}
                  className="px-4 py-3 text-foreground hover:bg-muted pl-8"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to="/orders"
                className="px-4 py-3 text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Orders
              </Link>
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-3 text-left text-red-500 hover:bg-muted"
                >
                  Logout ({user.email?.split('@')[0]})
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 text-primary font-bold hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login / Signup
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
