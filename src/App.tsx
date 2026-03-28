import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Toaster } from "@/components/ui/toaster";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const AddProduct = lazy(() => import("./pages/AddProduct"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
    </div>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/login" component={Login} />

          <Route path="/">
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </Route>

          <Route path="/products">
            <AdminLayout>
              <Products />
            </AdminLayout>
          </Route>

          <Route path="/products/add">
            <AdminLayout>
              <AddProduct />
            </AdminLayout>
          </Route>

          <Route path="/products/edit/:id">
            {() => (
              <AdminLayout>
                <AddProduct />
              </AdminLayout>
            )}
          </Route>

          <Route>
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-cairo" dir="rtl">
              <div className="text-center">
                <p className="text-[#d4af37] text-6xl font-black mb-4">404</p>
                <p className="text-gray-400 mb-6">الصفحة غير موجودة</p>
                <a href="/" className="bg-[#d4af37] text-black px-5 py-2.5 rounded-xl font-black text-sm">
                  الرئيسية
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </Suspense>
      <Toaster />
    </AuthProvider>
  );
}
