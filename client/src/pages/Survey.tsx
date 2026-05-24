import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useLocation } from "wouter";
import MainLayout from "@/components/MainLayout";
import BackToHome from "@/components/BackToHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, translations } from "@/lib/i18n";

function getSessionId() {
  let id = sessionStorage.getItem("survey_session_id");
  if (!id) {
    id = nanoid(32);
    sessionStorage.setItem("survey_session_id", id);
  }
  return id;
}

export default function Survey() {
  const { lang } = useLanguage();
  const s = translations.surveyPage;
  const [, navigate] = useLocation();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [segment, setSegment] = useState<string>("");

  const { data: pages, isLoading } = trpc.survey.getPages.useQuery();
  const submitMutation = trpc.survey.submit.useMutation();

  const sessionId = getSessionId();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">{t(s.loading, lang)}</span>
        </div>
      </MainLayout>
    );
  }

  if (!pages || pages.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center p-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-2">{t(s.comingSoonTitle, lang)}</h2>
            <p className="text-muted-foreground">{t(s.comingSoonDesc, lang)}</p>
          </div>
          <BackToHome />
        </div>
      </MainLayout>
    );
  }

  if (submitted) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center p-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-slide-up">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="gold-line mx-auto mb-4" />
            <h2 className="font-serif text-3xl font-light mb-3">{t(s.completeTitle, lang)}</h2>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              {t(s.completeDesc, lang)}
            </p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
              onClick={() => navigate(`/recommendations?segment=${segment}&session=${sessionId}`)}
            >
              {t(s.viewRecommendations, lang)}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <BackToHome className="animate-slide-up" />
        </div>
      </MainLayout>
    );
  }

  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;
  const progress = ((currentPageIndex) / totalPages) * 100;

  const handleAnswer = (questionId: number, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [String(questionId)]: value }));
  };

  const handleMultiAnswer = (questionId: number, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[String(questionId)] as string[]) ?? [];
      if (checked) {
        return { ...prev, [String(questionId)]: [...current, option] };
      } else {
        return { ...prev, [String(questionId)]: current.filter((v) => v !== option) };
      }
    });
  };

  const canProceed = () => {
    if (!currentPage) return false;
    const required = currentPage.questions.filter((q) => q.isRequired);
    return required.every((q) => {
      const ans = answers[String(q.id)];
      if (!ans) return false;
      if (Array.isArray(ans)) return ans.length > 0;
      return ans.trim().length > 0;
    });
  };

  const handleNext = async () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Submit
      const result = await submitMutation.mutateAsync({ sessionId, answers });
      setSegment(result.segment);
      setSubmitted(true);
    }
  };

  const handleBack = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] py-12">
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <BackToHome className="mb-6" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">
                {t(s.stepOf, lang)} {currentPageIndex + 1} {t(s.of, lang)} {totalPages}
              </span>
              <span className="text-sm text-primary font-medium">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-1.5 mb-6" />
            <div className="gold-line mb-4" />
            <h1 className="font-serif text-3xl font-light text-foreground mb-2">
              {currentPage?.title}
            </h1>
            {currentPage?.description && (
              <p className="text-muted-foreground leading-relaxed">{currentPage.description}</p>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {currentPage?.questions.map((question, qi) => (
              <div
                key={question.id}
                className="bg-card rounded-xl border border-border/60 p-6 animate-slide-up"
                style={{ animationDelay: `${qi * 60}ms` }}
              >
                <div className="flex items-start gap-3 mb-5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                    {qi + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground leading-relaxed">
                      {question.text}
                      {question.isRequired && <span className="text-destructive ml-1">*</span>}
                    </p>
                  </div>
                </div>

                {/* Single choice */}
                {question.type === "single_choice" && question.options && (
                  <RadioGroup
                    value={(answers[String(question.id)] as string) ?? ""}
                    onValueChange={(val) => handleAnswer(question.id, val)}
                    className="space-y-2 ml-9"
                  >
                    {question.options.map((option) => (
                      <div
                        key={option}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          answers[String(question.id)] === option
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                        }`}
                        onClick={() => handleAnswer(question.id, option)}
                      >
                        <RadioGroupItem value={option} id={`q${question.id}-${option}`} />
                        <Label htmlFor={`q${question.id}-${option}`} className="cursor-pointer text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple choice */}
                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-2 ml-9">
                    {question.options.map((option) => {
                      const checked = ((answers[String(question.id)] as string[]) ?? []).includes(option);
                      return (
                        <div
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                          }`}
                          onClick={() => handleMultiAnswer(question.id, option, !checked)}
                        >
                          <Checkbox
                            id={`q${question.id}-${option}`}
                            checked={checked}
                            onCheckedChange={(c) => handleMultiAnswer(question.id, option, !!c)}
                          />
                          <Label htmlFor={`q${question.id}-${option}`} className="cursor-pointer text-sm">
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text */}
                {question.type === "text" && (
                  <Textarea
                    className="ml-9 resize-none"
                    placeholder={t(s.shareThoughts, lang)}
                    value={(answers[String(question.id)] as string) ?? ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={3}
                  />
                )}

                {/* Scale */}
                {question.type === "scale" && (
                  <div className="ml-9 space-y-3">
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[parseInt((answers[String(question.id)] as string) ?? "5")]}
                      onValueChange={([val]) => handleAnswer(question.id, String(val))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t(s.scaleMin, lang)}</span>
                      <span className="font-semibold text-primary text-sm">
                        {answers[String(question.id)] ?? "5"}
                      </span>
                      <span>{t(s.scaleMax, lang)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentPageIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t(s.previous, lang)}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || submitMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : currentPageIndex === totalPages - 1 ? (
                <>
                  {t(s.completeAssessment, lang)}
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  {t(s.continue, lang)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
