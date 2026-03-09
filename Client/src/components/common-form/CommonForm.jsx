import React from 'react'
import {Form, FormControl, FormField, FormItem, FormLabel} from '../ui/form';
import {Input} from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import CommonButton from '../common-button/CommonButton';

function CommonForm({formControls=[],handleSubmit,submitButtonText,form}) {
  return (
    <>
    <Form {...form}> 
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            {Array.isArray(formControls) && formControls?.length > 0 ? 
            formControls.map((controlItem) => (
                <FormField
                    key={controlItem.id}
                    control={form.control}
                    name={controlItem.name || controlItem.id}
                    render = { ({field}) => {
                            return (
                                <FormItem>
                                    <FormLabel>{controlItem.label}</FormLabel>
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
                                                    className="w-full rounded h-12.5 border-none text-black bg-gray-200 text-[16px] outline-none drop-shadow-sm transition-all duration-300 ease-in-out focus:bg-gray-100 focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                            </FormControl>
                                        : controlItem.componentType === "select" ? (
                                            <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}
                                            >
                                            <FormControl>
                                                <SelectTrigger className="w-full rounded h-12.5 border-none text-black bg-gray-200 text-[16px] outline-none drop-shadow-sm transition-all duration-300 ease-in-out focus:bg-gray-100 focus:drop-shadow-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
                                                    <SelectValue
                                                    className="text-black focus:text-black"
                                                    placeholder={controlItem.placeholder || "Select"}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white">
                                                {controlItem.options?.map((optionItem) => (
                                                <SelectItem
                                                    key={optionItem.id}
                                                    value={String(optionItem.id)}
                                                    className="text-black cursor-pointer focus:text-black"
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
            <div className="flex justify-center mt-4 items-center">
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