import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  Moon,
  Sun,
  Briefcase,
  Home,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Smartphone,
  User,
  Users,
  MapPin,
} from 'lucide-react';

const CAPDvsAPD: React.FC = () => {
  const navigate = useNavigate();
  useSEO({
    title: 'CAPD vs APD: A Complete Guide to Peritoneal Dialysis Methods | PDsathi',
    description:
      'Compare CAPD (manual) and APD (cycler) peritoneal dialysis. Learn lifestyle differences, costs, flexibility, and which PD method fits your daily routine.',
    path: '/guides/capd-vs-apd',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to PDsathi
          </Button>
          <Badge variant="secondary" className="mb-3 text-xs">
            Patient Guide
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            CAPD vs APD: Choosing Your Peritoneal Dialysis Method
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
            If you are starting peritoneal dialysis, one of the first decisions you will face
            is whether to do manual daytime exchanges (CAPD) or use an overnight cycler
            machine (APD). This guide breaks down the real lifestyle differences so you can
            choose what fits your routine.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Quick definitions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                CAPD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Continuous Ambulatory Peritoneal Dialysis.</strong>{' '}
                You perform 3–5 fluid exchanges by hand throughout the day. Each exchange
                involves draining used dialysate and filling fresh fluid into your abdomen.
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Moon className="w-5 h-5 text-accent" />
                APD
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Automated Peritoneal Dialysis.</strong>{' '}
                A small cycler machine performs multiple exchanges automatically while you
                sleep. You typically connect before bed and disconnect in the morning.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Lifestyle comparison table */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            Lifestyle Comparison
          </h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-semibold text-foreground w-[32%]">
                      Factor
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground w-[34%]">
                      CAPD (Manual)
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground w-[34%]">
                      APD (Cycler)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <ComparisonRow
                    icon={<Clock className="w-4 h-4" />}
                    factor="When you dialyse"
                    capd="Daytime — 30–40 minutes per exchange, 3–5 times daily"
                    apd="Night-time — machine runs 8–10 hours while you sleep"
                  />
                  <ComparisonRow
                    icon={<Home className="w-4 h-4" />}
                    factor="Daytime freedom"
                    capd="Interruptions every few hours for exchanges"
                    apd="Usually free all day (may carry daytime dwell)"
                  />
                  <ComparisonRow
                    icon={<Activity className="w-4 h-4" />}
                    factor="Work & travel"
                    capd="Can work, but need clean space and supplies for midday exchanges"
                    apd="Easier for office jobs; cycler is less portable for travel"
                  />
                  <ComparisonRow
                    icon={<HeartPulse className="w-4 h-4" />}
                    factor="Sleep quality"
                    capd="Normal sleep — no machine noise"
                    apd="Machine beeps/alarms may disturb light sleepers"
                  />
                  <ComparisonRow
                    icon={<ShieldCheck className="w-4 h-4" />}
                    factor="Infection risk"
                    capd="More manual connections = slightly higher touch contamination risk"
                    apd="Fewer manual connections = lower touch contamination risk"
                  />
                  <ComparisonRow
                    icon={<AlertCircle className="w-4 h-4" />}
                    factor="Power dependency"
                    capd="No electricity needed"
                    apd="Requires reliable power; backup plan needed for outages"
                  />
                  <ComparisonRow
                    icon={<Smartphone className="w-4 h-4" />}
                    factor="Equipment"
                    capd="No machine; just bags, tubing, and warming method"
                    apd="Cycler machine, tubing sets, and drain bags"
                  />
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Pros & cons */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                CAPD Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />No machine noise or maintenance</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />No electricity required — works during power cuts</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Portable for travel with minimal luggage</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Gentler continuous clearance may suit some patients</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Lower upfront equipment cost</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                CAPD Disadvantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Daytime schedule tied to exchange times</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Visible catheter/bags during exchanges in public</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Higher risk of peritonitis from frequent connections</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Storage space needed for large monthly supply delivery</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Can be tiring for elderly or vision-impaired patients</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                APD Advantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Daytime is mostly free for work, family, and activities</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Fewer manual connections = lower infection risk</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Machine records treatment data automatically</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />May allow larger fluid removal overnight</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />Helpful for patients with limited dexterity</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="w-4 h-4 text-destructive" />
                APD Disadvantages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Machine alarms can disrupt sleep</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Dependence on electricity and clean water supply</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Cycler and supplies are bulky for travel</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Higher consumable and equipment costs</li>
                <li className="flex gap-2"><XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />Learning curve to troubleshoot alarms independently</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Suitability guide */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            Which Method Suits Whom?
          </h2>
          <div className="space-y-3">
            <SuitabilityCard
              method="CAPD may suit you if..."
              points={[
                'You have an irregular work or sleep schedule (e.g., shift work).',
                'You live in an area with unreliable electricity.',
                'You travel frequently and need a portable setup.',
                'You are comfortable with hands-on medical tasks and have good vision/dexterity.',
                'You prefer minimal equipment and no machine maintenance.',
              ]}
              tone="primary"
            />
            <SuitabilityCard
              method="APD may suit you if..."
              points={[
                'You work a regular daytime job or attend school/university.',
                'You want your days free for family, exercise, or social activities.',
                'You have limited hand dexterity or eyesight.',
                'You have a reliable home environment with stable power and water.',
                'You prefer automation and data tracking of your sessions.',
              ]}
              tone="accent"
            />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQ
              q="Can I switch from CAPD to APD later?"
              a="Yes. Many patients start with CAPD and switch to APD if their lifestyle changes or if daytime exchanges become difficult. Your nephrologist and PD nurse will retrain you on the cycler."
            />
            <FAQ
              q="Is one method more effective than the other?"
              a="Both methods can provide adequate dialysis when prescribed correctly. Your doctor calculates your Kt/V and creatinine clearance to ensure the regimen meets ISPD targets, regardless of modality."
            />
            <FAQ
              q="Do both methods use the same catheter?"
              a="Yes. Both CAPD and APD use the same peritoneal dialysis catheter. The difference is only in how the dialysate is delivered and drained."
            />
            <FAQ
              q="Can I do a mix of both?"
              a="Yes. Some patients use APD overnight plus one manual daytime exchange (often called CCPD with a midday dwell). This hybrid approach is common when more dialysis is needed."
            />
            <FAQ
              q="How does PDsathi help regardless of method?"
              a="PDsathi lets you log exchanges, track ultrafiltration, record lab results, and share data with your care team — whether you are on CAPD, APD, or a hybrid schedule."
            />
          </div>
        </section>

        <Separator />

        {/* Nepal-specific note */}
        <section>
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-base">
                    Considering PD in Nepal?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    In Nepal, CAPD supplies are often more widely available and do not require
                    electricity, making them practical in areas with frequent power cuts. APD
                    cyclers are increasingly available in major cities like Kathmandu and Pokhara.
                    Discuss supply logistics, power backup, and cost coverage with your nephrologist
                    and PD coordinator before deciding.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <section className="text-center pb-8">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Track Your PD Journey with PDsathi
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
            Whether you choose CAPD or APD, PDsathi helps you log every exchange, monitor
            your trends, and stay connected with your care team.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/')} className="rounded-full px-6">
              Go to PDsathi Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/install')} className="rounded-full px-6">
              Install the App
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          Content reviewed for clinical accuracy. Always consult your nephrologist for personalized advice.
        </p>
        <p className="text-[11px] text-muted-foreground/40 mt-1">
          Concept by Dr. Anil Pokhrel · Consultant Nephrologist
        </p>
      </footer>
    </div>
  );
};

/* Sub-components */

const ComparisonRow: React.FC<{
  icon: React.ReactNode;
  factor: string;
  capd: string;
  apd: string;
}> = ({ icon, factor, capd, apd }) => (
  <tr className="hover:bg-muted/20 transition-colors">
    <td className="px-4 py-3 align-top">
      <div className="flex items-center gap-2 text-foreground font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {factor}
      </div>
    </td>
    <td className="px-4 py-3 align-top text-muted-foreground">{capd}</td>
    <td className="px-4 py-3 align-top text-muted-foreground">{apd}</td>
  </tr>
);

const SuitabilityCard: React.FC<{
  method: string;
  points: string[];
  tone: 'primary' | 'accent';
}> = ({ method, points, tone }) => (
  <Card className={tone === 'accent' ? 'border-l-4 border-l-accent' : 'border-l-4 border-l-primary'}>
    <CardHeader className="pb-2">
      <CardTitle className="text-base">{method}</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {points.map((p, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${tone === 'accent' ? 'text-accent' : 'text-primary'}`}
            />
            {p}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

const FAQ: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <Card>
    <CardContent className="p-4 sm:p-5">
      <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">{q}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
    </CardContent>
  </Card>
);

export default CAPDvsAPD;
