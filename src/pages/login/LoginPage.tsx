import { startTransition, useState } from "react";
import {
  LockKeyOpen,
  Microscope,
  Pulse,
  Sparkle,
  VideoCamera,
} from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { UiLanguageSwitch } from "@/components/layout/UiLanguageSwitch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/useAuth";
import { useUiLanguage } from "@/features/i18n/useUiLanguage";

function createLoginSchema(emailError: string, codeError: string) {
  return z.object({
    email: z.email(emailError),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, codeError)
      .optional()
      .or(z.literal("")),
  });
}

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export function LoginPage() {
  const navigate = useNavigate();
  const { requestEmailCode, verifyEmailCode, isConfigured } = useAuth();
  const { t } = useUiLanguage();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const loginSchema = createLoginSchema(t.login.emailError, t.login.codeError);

  const highlights = [
    {
      title: t.login.highlights[0].title,
      description: t.login.highlights[0].description,
      icon: Microscope,
    },
    {
      title: t.login.highlights[1].title,
      description: t.login.highlights[1].description,
      icon: VideoCamera,
    },
    {
      title: t.login.highlights[2].title,
      description: t.login.highlights[2].description,
      icon: Pulse,
    },
  ];

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const errors = form.formState.errors;
  const isAwaitingCode = pendingEmail !== null;

  async function onSubmit(values: LoginFormValues) {
    try {
      if (!isAwaitingCode) {
        await requestEmailCode(values.email);
        setPendingEmail(values.email);
        form.setValue("code", "");
        toast.success(t.login.codeSentSuccess);
        return;
      }

      const code = values.code?.trim() ?? "";

      if (!/^\d{6}$/.test(code)) {
        form.setError("code", {
          type: "manual",
          message: t.login.codeError,
        });
        return;
      }

      await verifyEmailCode(pendingEmail, code);
      toast.success(t.login.loginSuccess);
      startTransition(() => {
        navigate("/dashboard", { replace: true });
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.login.loginError;
      toast.error(message);
    }
  }

  function handleChangeEmail() {
    const currentEmail = form.getValues("email");
    setPendingEmail(null);
    form.reset({
      email: currentEmail,
      code: "",
    });
  }

  async function handleResendCode() {
    if (!pendingEmail) {
      return;
    }

    try {
      await requestEmailCode(pendingEmail);
      form.setValue("code", "");
      toast.success(t.login.codeSentSuccess);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.login.loginError;
      toast.error(message);
    }
  }

  return (
    <div className="min-h-screen px-4 py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden p-6 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top_left,rgba(147,51,234,0.3),transparent_42%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.22),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  <Sparkle className="size-4" />
                  Radical Panel
                </div>
                <UiLanguageSwitch />
              </div>
              <div className="mt-8 max-w-2xl">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground lg:text-6xl">
                  {t.login.headline}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground lg:text-lg">
                  {t.login.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {highlights.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[1.75rem] border border-border/70 bg-background/72 p-5 shadow-sm shadow-fuchsia-500/5"
                >
                  <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-foreground">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex items-center p-6 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8">
              <div className="inline-flex size-14 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-fuchsia-500/30">
                <LockKeyOpen className="size-6" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
                {t.login.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {isAwaitingCode ? t.login.codeBody : t.login.body}
              </p>
            </div>

            {!isConfigured ? (
              <div className="mb-6 rounded-[1.5rem] border border-destructive/20 bg-destructive/8 p-4 text-sm leading-6 text-destructive">
                {t.login.missingConfig}
              </div>
            ) : null}

            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <Label htmlFor="email">{t.login.email}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.login.emailPlaceholder}
                  className="mt-2"
                  disabled={isAwaitingCode}
                  {...form.register("email")}
                />
                <FormMessage>{errors.email?.message}</FormMessage>
              </div>

              {isAwaitingCode ? (
                <>
                  <div className="rounded-[1.5rem] border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
                    {t.login.codeSentTo}{" "}
                    <span className="font-semibold text-foreground">
                      {pendingEmail}
                    </span>
                  </div>

                  <div>
                    <Label htmlFor="code">{t.login.code}</Label>
                    <Input
                      id="code"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder={t.login.codePlaceholder}
                      className="mt-2"
                      maxLength={6}
                      {...form.register("code")}
                    />
                    <FormMessage>{errors.code?.message}</FormMessage>
                  </div>
                </>
              ) : null}

              <div className="space-y-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center"
                  disabled={!isConfigured || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? isAwaitingCode
                      ? t.login.verifying
                      : t.login.submitting
                    : isAwaitingCode
                      ? t.login.verifySubmit
                      : t.login.submit}
                </Button>

                {isAwaitingCode ? (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 justify-center"
                      onClick={handleChangeEmail}
                      disabled={form.formState.isSubmitting}
                    >
                      {t.login.changeEmail}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1 justify-center"
                      onClick={() => {
                        void handleResendCode();
                      }}
                      disabled={!isConfigured || form.formState.isSubmitting}
                    >
                      {t.login.resendCode}
                    </Button>
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
