import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, MessageSquare } from "lucide-react";

const Analytics = () => {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [totalSituations, setTotalSituations] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchAnalytics();
    fetchTotalSituations();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchAnalytics = async () => {
    const { data } = await supabase
      .from("couple_analytics")
      .select("*")
      .order("period_start", { ascending: false })
      .limit(10);

    if (data) {
      setAnalytics(data);
    }
  };

  const fetchTotalSituations = async () => {
    const { count } = await supabase
      .from("situations")
      .select("*", { count: "exact", head: true });

    if (count !== null) {
      setTotalSituations(count);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Relationship Analytics</h2>
          <p className="text-muted-foreground">
            Track patterns and insights in your relationship journey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-soft">
            <CardHeader>
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent w-fit mb-2">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-2xl">{totalSituations}</CardTitle>
              <CardDescription>Total Situations</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary w-fit mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-2xl">{analytics.length}</CardTitle>
              <CardDescription>Analytics Reports</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Weekly and monthly insights, behavior patterns, and personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Analytics features are being developed</p>
              <p className="text-sm">
                Soon you'll see detailed insights about communication patterns, resolution
                trends, and personalized growth recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;