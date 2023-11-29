"use client"

import * as z from "zod";
import axios from "axios";
import { Billboard, Category } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";

const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().min(1),
});


type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
    initialData: Category | null;
    billboards: Billboard[];
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
    initialData,
    billboards
}) => {

    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? "Editar categoria" : "Criar categoria";
    const description = initialData ? "Editar um categoria" : "Adicionar uma categoria";
    const toastMessage = initialData ? "Categoria atualizada" : "Categoria criada";
    const action = initialData ? "Salvar mudanças" : "Criar";

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            billboardId: ''
        }
    });

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            setLoading(true);
            if( initialData) {
                await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/categories`, data);
            }
            router.push(`/${params.storeId}/categories`)
            router.refresh();
            toast.success(toastMessage);
        } catch (error) {
            toast.error("Algo deu errado")
        } finally {
            setLoading(false)
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true)
            await axios.delete(`/api/${params.storeId}/categories/${params.billboardId}`);
            router.push(`/${params.storeId}/categories`);
            router.refresh();
            toast.success("Billboard Excluido");

        } catch (error) {
            toast.error("Tenha certeza que você excluiu todos os produtos usando esta categoria")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <AlertModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                {initialData && (
                    <Button
                        disabled={loading}
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="Nome da Categoria" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="billboardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billboard</FormLabel>
                                    <FormControl>
                                    <Select 
                                    disabled={loading} 
                                    onValueChange={field.onChange} 
                                    value={field.value} 
                                    defaultValue={field.value}
                                    >    
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue 
                                        defaultValue={field.value}
                                        placeholder="Selecione um billboard"
                                        />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {billboards.map((billboard) => (
                                            <SelectItem
                                            key={billboard.id}
                                            value={billboard.id}
                                            >
                                             {billboard.label}           
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
        </>
    );
};