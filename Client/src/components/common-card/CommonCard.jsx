import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

function CommonCard({
  title,
  description,
  extraTextStyles,
  footerContent,
  content,
  headerRightContent,
  className,
}) {
  return (
    <Card className={`group flex flex-col gap-4 rounded-2xl border border-border/60 bg-white/80 p-6 shadow-sm shadow-slate-900/[0.03] backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:shadow-slate-900/[0.06] hover:-translate-y-0.5 hover:border-indigo-200/50 ${className || ''}`}>
      <CardHeader className="p-0">
        <div className="flex items-start justify-between gap-3">
          {title ? (
            <CardTitle
              className={`text-base font-semibold leading-snug text-foreground max-w-[220px] truncate ${
                extraTextStyles ? extraTextStyles : ""
              }`}
            >
              {title}
            </CardTitle>
          ) : null}
          {headerRightContent ? headerRightContent : null}
        </div>
        {description ? (
          <CardDescription className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      {content ? <CardContent className="p-0">{content}</CardContent> : null}
      {footerContent ? <CardFooter className="p-0 pt-2 border-t border-border/40">{footerContent}</CardFooter> : null}
    </Card>
  );
}

export default CommonCard;