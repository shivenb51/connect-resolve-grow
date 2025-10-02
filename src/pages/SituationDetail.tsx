import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Lightbulb, Scale } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const SituationDetail = () => {
  const { id } = useParams();
  const [situation, setSituation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSituation();
  }, [id]);

  const fetchSituation = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("situations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching situation:", error);
      navigate("/dashboard");
      return;
    }

    setSituation(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!situation) {
    return null;
  }

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{situation.title}</h1>
          <p className="text-muted-foreground">
            Analyzed on {new Date(situation.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Perspectives */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Person 1's Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{situation.person1_pov}</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Person 2's Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{situation.person2_pov}</p>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis */}
          <Card className="shadow-medium border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <CardTitle>AI Analysis</CardTitle>
              </div>
              <CardDescription>Empathetic understanding of your situation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm whitespace-pre-wrap">{situation.ai_analysis}</p>
              </div>
            </CardContent>
          </Card>

          {/* Verdict */}
          {situation.ai_verdict && (
            <Card className="shadow-medium border-2 border-accent/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle>Balanced Assessment</CardTitle>
                </div>
                <CardDescription>Understanding both perspectives</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{situation.ai_verdict}</p>
              </CardContent>
            </Card>
          )}

          {/* Solution */}
          {situation.ai_solution && (
            <Card className="shadow-medium bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle>Recommended Solution</CardTitle>
                </div>
                <CardDescription>Steps forward for growth and resolution</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{situation.ai_solution}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default SituationDetail;