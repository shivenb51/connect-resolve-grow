import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Plus, BarChart3, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [situations, setSituations] = useState<any[]>([]);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [linkingPartner, setLinkingPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchSituations();
  }, []);

  const checkUser = async () => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo-user');
    if (demoUser) {
      const user = JSON.parse(demoUser);
      setUser(user);
      setProfile({ id: user.id, email: user.email, partner_id: null });
      setLoading(false);
      return;
    }

    // Try Supabase auth as fallback
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      setProfile(profile);
    } catch (error) {
      console.warn('Supabase auth failed, redirecting to auth');
      navigate("/auth");
      return;
    }
    setLoading(false);
  };

  const fetchSituations = async () => {
    // Demo mode - use mock data
    const demoUser = localStorage.getItem('demo-user');
    if (demoUser) {
      const mockSituations = [
        {
          id: 'demo-1',
          title: 'Communication Styles',
          created_at: new Date().toISOString(),
          ai_analysis: 'This situation shows different communication preferences between partners.',
          ai_verdict: 'Both partners have valid communication styles that can complement each other.',
          ai_solution: 'Try to understand each other\'s communication preferences and find a middle ground.'
        }
      ];
      setSituations(mockSituations);
      return;
    }

    // Try Supabase as fallback
    try {
      const { data, error } = await supabase
        .from("situations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setSituations(data);
      }
    } catch (error) {
      console.warn('Failed to fetch situations:', error);
      setSituations([]);
    }
  };

  const handleLinkPartner = async () => {
    if (!partnerEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your partner's email address.",
        variant: "destructive",
      });
      return;
    }

    setLinkingPartner(true);

    try {
      const { data, error } = await supabase.functions.invoke('link-partner', {
        body: { partnerEmail },
      });

      if (error) {
        console.warn('Link partner function error:', error);
        toast({ 
          title: "Partner Linking Temporarily Unavailable", 
          description: "Partner linking is currently being set up. You can continue using the app solo for now.",
          variant: "destructive" 
        });
        return;
      }

      if (!data?.linkedPartnerId) {
        toast({ title: "Partner not found", description: "No account with that email. Ask them to sign up or continue solo." });
        return;
      }

      toast({ title: "Partner linked!", description: `Successfully linked with ${partnerEmail}` });
      setProfile({ ...profile, partner_id: data.linkedPartnerId });
      setPartnerEmail("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLinkingPartner(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              RelationSync
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              {user?.email}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground">
            Track your relationship journey and gain insights together.
          </p>
        </div>

        {!profile?.partner_id && (
          <Card className="shadow-medium mb-8 border-accent/50">
            <CardHeader>
              <CardTitle>Link Your Partner</CardTitle>
              <CardDescription>
                Connect with your partner to start analyzing together. Or continue solo — you can enter both perspectives yourself.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your partner's email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-md border bg-background"
                  disabled={linkingPartner}
                />
                <Button 
                  onClick={handleLinkPartner} 
                  disabled={linkingPartner}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {linkingPartner ? "Linking..." : "Link Partner"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your email: <span className="font-medium">{user?.email}</span>
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="shadow-soft hover:shadow-medium transition-all cursor-pointer" onClick={() => navigate("/submit")}>
            <CardHeader>
              <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent w-fit mb-2">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <CardTitle>New Situation</CardTitle>
              <CardDescription>
                Submit both perspectives for AI analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-soft hover:shadow-medium transition-all cursor-pointer" onClick={() => navigate("/analytics")}>
            <CardHeader>
              <div className="p-3 rounded-full bg-gradient-to-br from-accent to-primary w-fit mb-2">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle>View Analytics</CardTitle>
              <CardDescription>
                See patterns and insights over time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Recent Situations</CardTitle>
            <CardDescription>Your latest relationship discussions</CardDescription>
          </CardHeader>
          <CardContent>
            {situations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No situations yet. Start by submitting your first one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {situations.map((situation) => (
                  <div
                    key={situation.id}
                    className="p-4 rounded-lg border bg-card hover:shadow-soft transition-all cursor-pointer"
                    onClick={() => navigate(`/situation/${situation.id}`)}
                  >
                    <h3 className="font-semibold mb-2">{situation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(situation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;