import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContactField } from "@/lib/validation";

type FieldConfig = {
  name: ContactField;
  label: string;
  placeholder: string;
  type?: "text" | "tel" | "email";
  required?: boolean;
};

const NAME: FieldConfig = { name: "name", label: "Имя", placeholder: "Например: Анна Смирнова", required: true };
const ABOUT: FieldConfig = { name: "about", label: "Кто это", placeholder: "Например: дизайнер, подруга Маши" };
const HOW_WE_MET: FieldConfig = { name: "howWeMet", label: "Откуда знакомы", placeholder: "Например: учились вместе в МГУ" };
const PHONE: FieldConfig = { name: "phone", label: "Телефон", placeholder: "+7 999 123-45-67", type: "tel" };
const EMAIL: FieldConfig = { name: "email", label: "Почта", placeholder: "name@example.com", type: "email" };

export function ContactFields({
  idPrefix,
  defaults,
  errors,
  autoFocus,
}: {
  idPrefix: string;
  defaults?: Partial<Record<ContactField, string>>;
  errors?: Partial<Record<ContactField, string>>;
  autoFocus?: boolean;
}) {
  const field = (config: FieldConfig, focus = false) => (
    <Field
      key={config.name}
      config={config}
      id={`${idPrefix}-${config.name}`}
      defaultValue={defaults?.[config.name]}
      error={errors?.[config.name]}
      autoFocus={focus}
    />
  );

  return (
    <div className="grid gap-4">
      {field(NAME, autoFocus)}
      {field(ABOUT)}
      {field(HOW_WE_MET)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field(PHONE)}
        {field(EMAIL)}
      </div>
    </div>
  );
}

function Field({
  config,
  id,
  defaultValue,
  error,
  autoFocus,
}: {
  config: FieldConfig;
  id: string;
  defaultValue?: string;
  error?: string;
  autoFocus?: boolean;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={id}>
        {config.label}
        {config.required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        name={config.name}
        type={config.type ?? "text"}
        placeholder={config.placeholder}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        autoComplete="off"
        aria-required={config.required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
