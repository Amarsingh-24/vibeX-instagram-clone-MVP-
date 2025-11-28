import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Loader2 } from "lucide-react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim() === "") {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pb-20 md:pb-6">
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map((profile) => (
              <Link key={profile.id} to={`/profile/${profile.id}`}>
                <Card className="hover:bg-muted/50 transition-smooth">
                  <CardContent className="flex items-center space-x-4 p-4">
                    <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-sunset text-white">
                        {profile.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{profile.username}</p>
                      {profile.full_name && (
                        <p className="text-sm text-muted-foreground">
                          {profile.full_name}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              Search for users by username
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
