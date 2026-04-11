"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import Container from "@/components/layout/Container";
import { useFetch } from "@/hooks/useFetch";
import { supplierService } from "@/services/supplierService";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import { useForm } from "react-hook-form";

export default function SupplierProductsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const { showToast } = useToast();

    const { data: products, isLoading, error, refetch } = useFetch(
        () => supplierService.getProducts()
    );

    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

    const handleOpenDialog = (product?: any) => {
        if (product) {
            setEditingProduct(product);
            reset(product);
        } else {
            setEditingProduct(null);
            reset({ name: "", category: "", batchNo: "", description: "", price: "", qrCode: "" });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
        reset();
    };

    const onSubmit = async (data: any) => {
        try {
            if (editingProduct) {
                await supplierService.updateProduct(editingProduct.id, data);
                showToast("Product updated successfully!", "success");
            } else {
                await supplierService.createProduct(data);
                showToast("Product created successfully!", "success");
            }
            handleCloseDialog();
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Operation failed", "error");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            await supplierService.deleteProduct(id);
            showToast("Product deleted successfully!", "success");
            refetch();
        } catch (error: any) {
            showToast(error.response?.data?.message || "Delete failed", "error");
        }
    };

    if (isLoading) {
        return (
            <Container>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Spinner size="lg" />
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your product catalog
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Product List</CardTitle>
                        <CardDescription>
                            All products in your catalog
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!products || products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No products yet</p>
                                <Button className="mt-4" onClick={() => handleOpenDialog()}>
                                    Add Your First Product
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Batch No</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>QR Code</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product: any) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>{product.category}</TableCell>
                                            <TableCell><Badge variant="outline">{product.batchNo}</Badge></TableCell>
                                            <TableCell>{formatCurrency(product.price)}</TableCell>
                                            <TableCell>
                                                {product.qrCode ? (
                                                    <Badge variant="success">Generated</Badge>
                                                ) : (
                                                    <Badge variant="secondary">N/A</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenDialog(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Product Dialog */}
                <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold">
                            {editingProduct ? "Edit Product" : "Add New Product"}
                        </h2>
                        <p className="text-muted-foreground">
                            {editingProduct ? "Update product details" : "Create a new product"}
                        </p>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                {...register("name", { required: true })}
                                label="Product Name"
                                placeholder="Enter product name"
                            />
                            <Input
                                {...register("category", { required: true })}
                                label="Category"
                                placeholder="e.g., Electronics, Food, Clothing"
                            />
                            <Input
                                {...register("batchNo", { required: true })}
                                label="Batch Number"
                                placeholder="Enter batch number"
                            />
                            <Input
                                {...register("price", { required: true, valueAsNumber: true })}
                                label="Price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                            />
                            <Textarea
                                {...register("description")}
                                label="Description (Optional)"
                                placeholder="Enter product description"
                            />
                            <Input
                                {...register("qrCode")}
                                label="QR Code (Optional)"
                                placeholder="Leave empty to auto-generate"
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isSubmitting}>
                                    {editingProduct ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </div>
        </Container>
    );
}
