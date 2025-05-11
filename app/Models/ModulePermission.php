<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ModulePermission extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'role_id',
        'module_id',
        'name',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    protected $table = 'module_permissions';

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public static function booted()
    {
        static::creating(function ($user) {
            $user->id = (string) Str::uuid();
        });
    }
}
