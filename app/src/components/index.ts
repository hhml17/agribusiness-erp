/**
 * Components Index
 * Export all reusable components from a single location
 */

// Legacy components - will be removed
export { Table as TableOld } from './Table';
export type { Column } from './Table';
export { Button as ButtonOld } from './Button';
export { Modal as ModalOld } from './Modal';
export { Card as CardOld } from './Card';
export { Alert as AlertOld } from './Alert';
export type { AlertType } from './Alert';
export { CuentaContableSelect } from './CuentaContableSelect';

// Shadcn/UI components - preferred
export { Button } from './ui/button';
export { Input } from './ui/input';
export { Label } from './ui/label';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table';
export { Alert, AlertDescription, AlertTitle } from './ui/alert';
export { Badge } from './ui/badge';
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
export { Textarea } from './ui/textarea';
export { RadioGroup, RadioGroupItem } from './ui/radio-group';
