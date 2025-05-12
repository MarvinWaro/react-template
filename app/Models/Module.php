<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Module extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order',
        'parent_id',
        'name',
        'path',
        'icon',
        'description',
        'available_actions',
        'is_client',
        'group_title',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    protected $casts = [
        'available_actions' => 'array',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'module_permissions', 'module_id', 'role_id')
            ->wherePivotNull('deleted_at');
    }

    public function users()
    {
        return $this->roles()->with('users');
    }

    public function modulePermissions()
    {
        return $this->hasMany(ModulePermission::class, 'module_id');
    }

    public function children()
    {
        return $this->hasMany(Module::class, 'parent_id');
    }

    public function parent()
    {
        return $this->belongsTo(Module::class, 'parent_id');
    }

    public static function booted()
    {
        static::creating(function ($user) {
            $user->id = (string) Str::uuid();
        });

        static::deleting(function ($table) {
            $table->modulePermissions()->delete();
        });
    }
}
