import React from 'react'
import {Form, FormControl, FormField, FormItem, FormLabel} from '../ui/form';
import {Input} from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import CommonButton from '../common-button/CommonButton';

function CommonForm({formControls=[],handleSubmit,submitButtonText,form}) {
  return (
    <>
    <Form {...form}> 
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {Array.isArray(formControls) && formControls?.length > 0 ? 
            formControls.map((controlItem) => (
                <FormField
                    key={controlItem.id}
                    control={form.control}
                    name={controlItem.name || controlItem.id}
                    render = { ({field}) => {
                            return (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground/80">{controlItem.label}</FormLabel>
                                    { controlItem.componentType === "input" ?
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder={controlItem.placeholder}
                                                    type={controlItem.type}
                                                    id={controlItem.id}
                                                    value={field.value ?? ""}
                                                    onChange={field.onChange}
                                                    required={controlItem.required}
                                                    disabled={controlItem.disabled}
                                                    className="w-full h-11 rounded-xl border border-border/80 bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20"
                                                />
                                            </FormControl>
                                        : controlItem.componentType === "select" ? (
                                            <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                            >
                                            <FormControl>
                                                <SelectTrigger className="w-full h-11 rounded-xl border border-border/80 bg-muted/30 px-4 text-sm text-foreground transition-all duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20">
                                                    <SelectValue
                                                    className="text-foreground"
                                                    placeholder={controlItem.placeholder || "Select"}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl border border-border/60 bg-white/95 shadow-xl backdrop-blur-xl">
                                                {controlItem.options?.map((optionItem) => (
                                                <SelectItem
                                                    key={optionItem.id}
                                                    value={String(optionItem.id)}
                                                    className="text-sm text-foreground cursor-pointer rounded-lg transition-colors focus:bg-indigo-50 focus:text-indigo-700"
                                                >
                                                    {optionItem.label}
                                                </SelectItem>
                                                ))}
                                            </SelectContent>
                                            </Select>
                                        ) : null
                                    }
                                </FormItem>
                            )
                        } 
                    }
                >
                </FormField>
            ))
            : null
            }
            <div className="flex justify-end pt-2">
                <CommonButton 
                    type={"submit"}
                    buttonText={submitButtonText}
                />
            </div>
        </form>
    </Form>
    </>
  )
}

export default CommonForm;