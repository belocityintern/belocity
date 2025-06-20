"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TokenSearchProps {
  address: string;
  setAddress: (address: string) => void;
  handleSearch: () => void;
  loading: boolean;
}

export function TokenSearch({ address, setAddress, handleSearch, loading }: TokenSearchProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };
  
  return (
    <form onSubmit={handleFormSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder="Enter token address..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        <Search className="h-4 w-4 mr-2" />
        {loading ? 'Analyzing...' : 'Analyze'}
      </Button>
    </form>
  );
} 