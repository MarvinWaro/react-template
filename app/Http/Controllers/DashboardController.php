<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $user = $request->user();
    
        if (!($user->hasAdminRole() || $user->superstaff)) {
            return redirect()->route('home');
        }
    
        return Inertia::render('dashboard');
    }
}
